# ADR: SCALE-Normalized ABAF for Long-Term Balance Adjustments

**Date**: 2026-03-05
**Status**: Proposed

---

## Context

The Asset Tokenization Studio smart contracts use an Aggregated Balance Adjustment Factor (ABAF) system to apply balance adjustments (amortization, token splits, corporate actions) to all token holders without iterating over individual balances. The system works by storing a global ABAF and a per-user Last ABAF (LABAF), computing each holder's effective balance lazily as `storedBalance × (ABAF / LABAF)`.

The current implementation multiplies ABAF by the adjustment factor on each `adjustBalances` call without normalization:

```solidity
// AdjustBalancesStorageWrapper1.sol:52
abaf = getAbaf() * factor;
```

This creates two critical problems for financial instruments requiring long-term repeated adjustments:

1. **Overflow**: For a bond that doubles tokens annually over 30 years, using an 18-decimal precision factor (`2e18`), ABAF overflows `uint256` after approximately 4 adjustments because the factor compounds as `(2e18)^n`, exceeding `uint256` max (~1.15e77) by the 5th step.

2. **Unbounded decimal growth**: Each adjustment adds to `tokenDecimals` via `_adjustDecimals(decimals)`, causing the token's decimal count to grow linearly with the number of adjustments (e.g., +18 per adjustment, reaching 360+ decimals after 20 adjustments).

These limitations make the current system unsuitable for:

- **Loan amortization**: Monthly principal reductions over 30 years (360 adjustments)
- **Bond token doubling**: Annual token count doubling combined with periodic amortization (390+ adjustments)
- **Any long-lived instrument** requiring more than ~4 high-precision balance adjustments

The core issue is that the ABAF accumulates raw multiplication results without ever normalizing, causing unbounded growth regardless of whether the underlying economic value is increasing or decreasing.

---

## Decision

Introduce a constant `SCALE` denominator (1e18) to normalize the ABAF after every multiplication, following the pattern established by Aave V2/V3 aTokens (`liquidityIndex` with `RAY = 1e27`).

The change modifies three internal functions in the ABAF system:

### 1. ABAF Update — Normalize after multiplication

```solidity
uint256 constant SCALE = 1e18;

// AdjustBalancesStorageWrapper1._updateAbaf
function _updateAbaf(uint256 factor) internal override {
  _adjustBalancesStorage().abaf = (_getAbaf() * factor) / SCALE;
}
```

### 2. Factor Calculation — Scale-aware division

```solidity
// AdjustBalancesStorageWrapper1._calculateFactor
function _calculateFactor(uint256 _abaf, uint256 _labaf) internal pure override returns (uint256 factor_) {
  factor_ = (_abaf * SCALE) / _labaf;
}
```

### 3. Balance Application — Divide out the scale

```solidity
// ERC20StorageWrapper1._adjustTotalBalanceFor (and all similar functions)
uint256 newBalance = (oldBalance * factor) / SCALE;
```

### 4. Total Supply and Max Supply — Same normalization

```solidity
// ERC20StorageWrapper1._adjustTotalSupply
_erc20Storage().totalSupply = (_erc20Storage().totalSupply * factor) / SCALE;
```

### 5. Factor Encoding

Factors are now expressed relative to SCALE:

| Action                          | Factor Value              |
| ------------------------------- | ------------------------- |
| No change (×1)                  | `1e18`                    |
| Double (×2)                     | `2e18`                    |
| Halve (×0.5)                    | `5e17`                    |
| Reduce by 1/3 (×1/3)            | `333,333,333,333,333,333` |
| Monthly amortization (×359/360) | `997,222,222,222,222,222` |

### 6. Decimal parameter

The `decimals` parameter in `adjustBalances(factor, decimals)` is no longer needed for encoding fractional factors. It should be passed as `0` for pure scaling adjustments. It remains available for genuine decimal changes (e.g., re-denomination).

### Worked Example: 18 Holders × 1 Token, ×1/3 Adjustment

Setup: 18 token holders, each holding 1 token (stored as 1e18 with 18 decimals). Total supply = 18e18. A ×1/3 balance adjustment is applied.

#### Current System (no normalization)

To represent ×1/3 as an integer, the caller passes `factor = 333,333,333,333,333,333` and `decimals = 18`:

**After 1st adjustment (×1/3):**

| Field          | Value                                       |
| -------------- | ------------------------------------------- |
| ABAF           | `1 × 333,333,333,333,333,333 = 3.33e17`     |
| Token decimals | `18 + 18 = 36`                              |
| Total supply   | `18e18 × 333,333,333,333,333,333 = 5.99e36` |

Holder reads balance (lazy — stored = 1e18, LABAF = 1):

```
factor   = ABAF / LABAF = 3.33e17 / 1 = 3.33e17
adjusted = 1e18 × 3.33e17 = 3.33e35
real     = 3.33e35 / 1e36 = 0.333333333333333333
expected = 0.333333...  →  error = 3.33e-19 (1 wei) ✓
```

**After 2nd adjustment (×1/3 again, ×1/9 total):**

| Field          | Value                         |
| -------------- | ----------------------------- |
| ABAF           | `3.33e17 × 3.33e17 = 1.11e35` |
| Token decimals | `36 + 18 = 54`                |

Holder A — never interacted (stored = 1e18, LABAF = 1):

```
factor   = 1.11e35 / 1 = 1.11e35
adjusted = 1e18 × 1.11e35 = 1.11e53
real     = 1.11e53 / 1e54 = 0.111111111111111110
expected = 0.111111...  →  error = 1e-18 (1 wei) ✓
```

Holder B — interacted after 1st adjustment (stored = 3.33e35, LABAF = 3.33e17):

```
factor   = 1.11e35 / 3.33e17 = 333,333,333,333,333,330  ← TRUNCATED (lost 3)
adjusted = 3.33e35 × 3.33e17 (truncated) = 1.11e53 - 9.99e35
real     = 0.111111111111111109
expected = 0.111111...  →  error = 2e-18 (2 wei, compounding) ⚠
```

**ABAF growth — system breaks at adjustment #5:**

| Adjustment | ABAF    | Token Decimals | Status                                      |
| ---------- | ------- | -------------- | ------------------------------------------- |
| 0          | 1       | 18             | OK                                          |
| 1          | 3.33e17 | 36             | OK                                          |
| 2          | 1.11e35 | 54             | OK                                          |
| 3          | 3.70e52 | 72             | OK                                          |
| 4          | 1.23e70 | 90             | OK                                          |
| 5          | 4.11e87 | 108            | **OVERFLOW** (exceeds uint256 max ~1.15e77) |

#### SCALE-Normalized System

Factor is expressed relative to SCALE: `factor = SCALE / 3 = 333,333,333,333,333,333`. No `decimals` parameter needed.

**After 1st adjustment (×1/3):**

| Field          | Value                                |
| -------------- | ------------------------------------ |
| ABAF           | `(1e18 × 3.33e17) / 1e18 = 3.33e17`  |
| Token decimals | `18` (unchanged)                     |
| Total supply   | `(18e18 × 3.33e17) / 1e18 = 5.99e18` |

Holder reads balance (stored = 1e18, LABAF = 1e18):

```
calcFactor = (3.33e17 × 1e18) / 1e18 = 3.33e17
adjusted   = (1e18 × 3.33e17) / 1e18 = 3.33e17
real       = 3.33e17 / 1e18 = 0.333333333333333333
error      = 3.33e-19 (1 wei) ✓  — same precision as current system
```

**After 2nd adjustment (×1/3 again, ×1/9 total):**

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| ABAF           | `(3.33e17 × 3.33e17) / 1e18 = 1.11e17` |
| Token decimals | `18` (still unchanged)                 |

Holder A — never interacted (stored = 1e18, LABAF = 1e18):

```
calcFactor = (1.11e17 × 1e18) / 1e18 = 1.11e17
adjusted   = (1e18 × 1.11e17) / 1e18 = 1.11e17
real       = 1.11e17 / 1e18 = 0.111111111111111110
error      = 1e-18 (1 wei) ✓
```

Holder B — interacted after 1st adjustment (stored = 3.33e17, LABAF = 3.33e17):

```
calcFactor = (1.11e17 × 1e18) / 3.33e17 = 3.33e17 (truncated same way)
adjusted   = (3.33e17 × 3.33e17) / 1e18 = 1.11e17 - 1
real       = 0.111111111111111109
error      = 2e-18 (2 wei) — same as current system
```

**ABAF stays bounded — no overflow at any step:**

| Adjustment | ABAF (Current) | ABAF (SCALE)                              | Token Decimals (SCALE) |
| ---------- | -------------- | ----------------------------------------- | ---------------------- |
| 0          | 1              | 1e18                                      | 18                     |
| 1          | 3.33e17        | 3.33e17                                   | 18                     |
| 2          | 1.11e35        | 1.11e17                                   | 18                     |
| 3          | 3.70e52        | 3.70e16                                   | 18                     |
| 4          | 1.23e70        | 1.23e16                                   | 18                     |
| 5          | **OVERFLOW**   | 4.11e15                                   | 18                     |
| 10         | **OVERFLOW**   | 1.69e13                                   | 18                     |
| 30         | **OVERFLOW**   | 5.76e6                                    | 18                     |
| 360        | **OVERFLOW**   | ≈0 (underflow — correct: 1/3^360 < 1 wei) | 18                     |

#### Key Takeaway

Both systems produce identical per-step precision (±1-2 wei). The difference is that the current system's ABAF grows unboundedly and overflows after 5 adjustments, while the SCALE system's ABAF stays within `uint256` range indefinitely. Token decimals remain fixed at 18 instead of growing by 18 per adjustment.

---

The rationale for choosing this approach:

- **Minimal change**: Only 3 core functions are modified; the rest of the ABAF/LABAF infrastructure (per-user tracking, per-partition tracking, locks, holds, clears, freezes) remains unchanged in structure
- **Industry-proven**: The identical pattern secures $10B+ TVL in Aave V2/V3
- **Bidirectional**: Handles both growth (doubling) and reduction (amortization) natively
- **No new dependencies**: Pure arithmetic change, no external libraries required
- **Gas cost**: One additional division (~5 gas) per adjustment operation

---

## Consequences

### Positive

- **POS-001**: Eliminates `uint256` overflow for any practical number of adjustments. A 30-year bond with annual doubling + monthly amortization produces ABAF ≈ 3.87e26, well within `uint256` range
- **POS-002**: Token decimals remain stable — no unbounded growth of the `decimals` field, preserving compatibility with wallets, explorers, and external integrations
- **POS-003**: Follows the battle-tested Aave scaled-balance pattern (production since 2020, $10B+ TVL), reducing implementation risk
- **POS-004**: Enables new financial product types that require hundreds of balance adjustments over their lifetime (30-year mortgages, long-dated bonds, perpetual instruments)
- **POS-005**: Precision loss per step remains identical to the current system (≤1 wei per 1e18 tokens), with no cumulative degradation beyond what integer arithmetic inherently produces

### Negative

- **NEG-001**: Breaking change in factor encoding — all existing callers of `adjustBalances` must update their factor values to be SCALE-relative (e.g., `2` becomes `2e18`). Scheduled balance adjustments already stored on-chain would need migration
- **NEG-002**: Extreme reduction scenarios (e.g., 40+ consecutive 1/3 reductions without any growth) cause ABAF to underflow to 0, effectively zeroing all balances. This is mathematically correct (1/3^40 < 1 wei) but must be documented
- **NEG-003**: Adds one division operation per adjustment and per lazy balance read, increasing gas cost by ~5 gas per operation — negligible but non-zero
- **NEG-004**: Requires updating all test suites that assert on ABAF values or balance adjustment results, as the numeric values will change
- **NEG-005**: Initial ABAF must be set to `SCALE` (1e18) instead of relying on `_zeroToOne` returning 1 for uninitialized values. Existing deployed tokens with ABAF=1 need migration logic

---

## Alternatives Considered

### Logarithmic ABAF (Log-Scale Encoding)

- **ALT-001**: **Description**: Store ABAF as `log2(abaf) × PRECISION` instead of the raw value. On each adjustment, add `log2(factor)` instead of multiplying. Balance computation requires exponentiation: `balance = stored × 2^((logAbaf - logLabaf) / PRECISION)`. After 30 years of doubling, logAbaf = 30 — a trivially small number that never overflows
- **ALT-002**: **Rejection Reason**: Requires `exp2` and `log2` functions on-chain, adding external library dependencies (PRBMath or Solady). Gas cost is significantly higher (~500 gas per log/exp vs ~5 gas for a division). The added complexity and dependency risk outweigh the marginal benefit over the SCALE approach, which already solves the overflow problem within `uint256` range for all practical scenarios

### Epoch-Based ABAF Reset (Materialize-and-Reset)

- **ALT-003**: **Description**: Keep the current multiplicative system but periodically materialize all holder balances by iterating through the holder list, applying the accumulated factor to each stored balance, and resetting ABAF to 1. This prevents overflow by ensuring ABAF never accumulates beyond a few steps
- **ALT-004**: **Rejection Reason**: Requires O(n) gas cost proportional to the number of token holders, making it impractical for tokens with more than ~1,000 holders. A single reset for 10,000 holders could cost 5M+ gas. It also introduces a privileged operation that must be called at the right time, creating operational risk. The SCALE approach achieves the same result with O(1) cost per adjustment

### Shares-Based Model (Lido stETH Pattern)

- **ALT-005**: **Description**: Replace the balance mapping entirely with a shares mapping. Store `shares[user]` instead of `balances[user]`, and compute balance as `shares[user] × totalPooledAssets / totalShares`. Adjustments only update the two global variables. Used by Lido stETH ($15B+ TVL)
- **ALT-006**: **Rejection Reason**: Requires a fundamental restructuring of the storage model, affecting every function that reads or writes balances, partitions, locks, holds, clears, and freezes. The existing Diamond pattern facets across all 4 layers depend on the current `balances` mapping structure. Migration risk is high and the refactoring scope is disproportionate to the problem being solved. The SCALE approach achieves equivalent overflow safety with minimal code change

### Do Nothing

- **ALT-007**: **Description**: Accept the current limitation and restrict the platform to financial instruments requiring fewer than 4 high-precision balance adjustments
- **ALT-008**: **Rejection Reason**: Eliminates the ability to support loan amortization, long-dated bonds, and any instrument with periodic adjustments — a core business requirement for an asset tokenization platform

---

## Implementation Notes

- **IMP-001**: The `SCALE` constant (1e18) should be defined in `layer_0/constants/values.sol` alongside existing constants, ensuring consistent usage across all facets
- **IMP-002**: The `_zeroToOne` function must return `SCALE` (1e18) instead of `1` for uninitialized ABAF/LABAF values, so that the first factor calculation produces correct results: `(SCALE × SCALE) / SCALE = SCALE`
- **IMP-003**: All functions in `AdjustBalancesStorageWrapper2` that apply factors to balances, allowances, locks, holds, clears, and frozen amounts must consistently apply the `/ SCALE` normalization. A systematic audit of every `* factor` occurrence is required
- **IMP-004**: For existing deployed tokens, a one-time migration must multiply the stored ABAF and all LABAF values by SCALE (1e18). This can be implemented as a Diamond facet upgrade with an initializer function
- **IMP-005**: The `decimals` parameter in `adjustBalances(factor, decimals)` should be passed as `0` for standard scaling operations. Documentation must clarify that factors are now SCALE-relative
- **IMP-006**: Success criteria — after implementation: (a) the existing test suite passes with updated factor values, (b) a new fuzz test confirms no overflow for 1,000+ sequential adjustments with random factors in range [1, 10×SCALE], (c) a 30-year bond simulation test passes with annual doubling + monthly amortization

---

## References

- **REF-001**: [Aave V3 ScaledBalanceTokenBase](https://github.com/aave/aave-v3-core) — Production implementation of scaled balance with RAY (1e27) normalization
- **REF-002**: [Lido stETH Shares Model](https://github.com/lidofinance/core/blob/master/contracts/0.4.24/StETH.sol) — Alternative shares-based rebase implementation
- **REF-003**: [Ampleforth UFragments (Gons)](https://github.com/ampleforth/uFragments) — Fixed internal denomination approach with scaledBalanceOf
- **REF-004**: [ERC-4626 Tokenized Vault Standard](https://eips.ethereum.org/EIPS/eip-4626) — Ethereum standard for shares/assets conversion pattern
- **REF-005**: Current ABAF implementation — `packages/ats/contracts/contracts/layer_0/adjustBalances/AdjustBalancesStorageWrapper1.sol`
- **REF-006**: Current balance adjustment entry point — `packages/ats/contracts/contracts/layer_2/adjustBalances/AdjustBalances.sol`
- **REF-007**: Current ERC20 balance storage — `packages/ats/contracts/contracts/layer_0/ERC1400/ERC20/ERC20StorageWrapper1.sol`
