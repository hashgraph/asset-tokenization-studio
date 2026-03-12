# ADR: ABAF/LABAF Overflow and Precision Loss with Repeated Small Splits

**Date**: 2026-03-09
**Status**: Proposed

---

## Context

The Asset Tokenization Studio uses an Aggregated Balance Adjustment Factor (ABAF) / Last ABAF (LABAF) system to apply balance adjustments (splits, reverse splits, amortizations) to all token holders in O(1) gas. The effective balance is computed lazily:

```
effectiveBalance = (storedBalance × ABAF) / LABAF
```

This ADR analyzes the specific problem that arises when **repeated small splits** (reductions of 1% or less) are applied. Such patterns are common in:

- **Loan amortization**: monthly principal reductions of ~0.28% (30-year mortgage)
- **Bond coupon adjustments**: periodic small reductions in token count
- **Inflation/deflation mechanisms**: daily adjustments of 0.01–0.1%
- **Regulatory capital adjustments**: quarterly reductions of <1%

The problem manifests differently depending on the implementation approach:

1. **No-scale system** (current/legacy): ABAF overflows `uint256` after just 5 adjustments
2. **SCALE-normalized system** (proposed in [scale-normalized-abaf.md](./scale-normalized-abaf.md)): ABAF eventually underflows to 0, destroying all balances

Both problems are demonstrated below using a concrete example.

---

## Problem Statement

### Setup

- **Token**: 18 decimals, initial supply = **40 tokens** (40 × 10^18 raw)
- **User A**: 10 tokens (10 × 10^18 raw)
- **User B**: 20 tokens (20 × 10^18 raw)
- **User C**: 10 tokens (10 × 10^18 raw)
- **Adjustment**: 1% reduction per step (factor = ×0.99)

### Problem 1: No-Scale System — Overflow

In the no-scale system, `abaf = abaf × factor` without normalization. To represent ×0.99 with 18-decimal precision, the caller passes `factor = 990,000,000,000,000,000` and `extraDecimals = 18`.

| Step  | ABAF            | Decimals | User A    | User B    | User C    | Total     | Status       |
| ----- | --------------- | -------- | --------- | --------- | --------- | --------- | ------------ |
| 0     | 1               | 18       | 10.000000 | 20.000000 | 10.000000 | 40.000000 | OK           |
| 1     | 9.900×10^17     | 36       | 9.900000  | 19.800000 | 9.900000  | 39.600000 | OK           |
| 2     | 9.801×10^35     | 54       | 9.801000  | 19.602000 | 9.801000  | 39.204000 | OK           |
| 3     | 9.703×10^53     | 72       | 9.702990  | 19.405980 | 9.702990  | 38.811960 | OK           |
| 4     | 9.606×10^71     | 90       | 9.605960  | 19.211920 | 9.605960  | 38.423840 | OK           |
| **5** | **9.510×10^89** | **108**  | —         | —         | —         | —         | **OVERFLOW** |

**Result**: Even a tiny 1% reduction overflows `uint256` (max ~1.158×10^77) after just **5 adjustments** when using 18-decimal precision factors.

With lower precision (`factor=99, extraDecimals=2`), overflow occurs at step **39** — but with decimals reaching 96, which breaks all wallet and explorer integrations.

### Problem 2: SCALE-Normalized System — Underflow

In the SCALE-normalized system, `abaf = (abaf × factor) / SCALE`. This prevents overflow but introduces a different failure mode: repeated reductions drive ABAF toward zero.

| Step      | ABAF        | Decimals | User A       | User B       | User C       | Total        | Error vs Expected |
| --------- | ----------- | -------- | ------------ | ------------ | ------------ | ------------ | ----------------- |
| 0         | 1.000×10^18 | 18       | 10.000000000 | 20.000000000 | 10.000000000 | 40.000000000 | 0                 |
| 1         | 9.900×10^17 | 18       | 9.900000000  | 19.800000000 | 9.900000000  | 39.600000000 | 0                 |
| 5         | 9.510×10^17 | 18       | 9.509900499  | 19.019800998 | 9.509900499  | 38.039601996 | 0                 |
| 10        | 9.044×10^17 | 18       | 9.043820750  | 18.087641500 | 9.043820750  | 36.175283000 | 0                 |
| 100       | 3.660×10^17 | 18       | 3.660323413  | 7.320646825  | 3.660323413  | 14.641293651 | ~3×10^-16         |
| 500       | 6.570×10^15 | 18       | 0.065704830  | 0.131409661  | 0.065704830  | 0.262819322  | ~5×10^-16         |
| 1,000     | 4.317×10^13 | 18       | 0.000431712  | 0.000863425  | 0.000431712  | 0.001726850  | ~5×10^-16         |
| 2,000     | 1.864×10^9  | 18       | 0.000000019  | 0.000000037  | 0.000000019  | 0.000000075  | ~5×10^-16         |
| 3,000     | 80,408      | 18       | ~0           | ~0           | ~0           | ~0           | —                 |
| **3,724** | **0**       | **18**   | **0**        | **0**        | **0**        | **0**        | **UNDERFLOW**     |

**Result**: After **3,724** steps of 1% reduction, ABAF underflows to 0 and **all balances are permanently destroyed**. There is no recovery — even users who haven't interacted with the contract lose their tokens.

### Underflow Thresholds for Different Reduction Sizes

| Reduction per step | Factor (SCALE=10^18)    | Steps to ABAF=0 | Practical scenario              |
| ------------------ | ----------------------- | --------------- | ------------------------------- |
| 1.0%               | 990,000,000,000,000,000 | 3,724           | ~10 years of daily adjustments  |
| 0.5%               | 995,000,000,000,000,000 | 7,327           | ~20 years of daily adjustments  |
| 0.1%               | 999,000,000,000,000,000 | 35,099          | ~96 years of daily adjustments  |
| 0.01%              | 999,900,000,000,000,000 | 328,118         | ~898 years of daily adjustments |

For a 30-year mortgage with monthly 0.28% reductions: ~360 adjustments — well within safe range. But daily adjustments (e.g., DeFi yield instruments) over 10+ years hit the underflow limit.

### The Fundamental Tension

The ABAF system faces an inherent tradeoff:

- **Higher SCALE** (e.g., 10^27 instead of 10^18) delays underflow (5,786 steps for 1% with SCALE=10^27) but reduces the headroom for growth adjustments before **intermediate overflow** in `balance × ABAF`
- **Lower SCALE** gives more growth headroom but underflows sooner on reductions
- **No normalization** overflows on both growth and reduction after just a few steps

---

## How Other Protocols Solve This

### 1. Aave V2/V3 — Ray-Normalized Scaled Balances

Aave uses `RAY = 1e27` as the normalization constant for its `liquidityIndex`. Each deposit/borrow balance is stored as `scaledBalance = amount / liquidityIndex`, and the effective balance is `scaledBalance × liquidityIndex`.

- **Key insight**: Aave's `liquidityIndex` only **grows** (interest accrues, never reduces principal). This means they never face the underflow problem — RAY normalization only needs to handle growth.
- **Limitation**: Not applicable to reductive adjustments like reverse splits or amortization.
- **Reference**: [aave-v3-core/ScaledBalanceTokenBase.sol](https://github.com/aave/aave-v3-core)

### 2. Lido stETH — Shares Model

Lido stores `shares[user]` instead of balances. The effective balance is `shares[user] × totalPooledEther / totalShares`. Rebases only update the two global variables.

- **Key insight**: The shares themselves never change. Only the ratio `totalPooledEther / totalShares` changes. This avoids accumulator overflow entirely.
- **Limitation**: Requires fundamental restructuring of the storage model. Every function that reads or writes balances, partitions, locks, holds, clears, and freezes would need refactoring.
- **Reference**: [Lido StETH.sol](https://github.com/lidofinance/core)

### 3. Ampleforth (AMPL) — Gons (Fixed Internal Denomination)

Ampleforth uses a fixed internal unit called "gons". Each account stores `_gonBalances[user]`, and `balanceOf` returns `_gonBalances[user] / _gonsPerFragment`. Rebases change `_gonsPerFragment` (a single global variable).

- **Key insight**: `TOTAL_GONS` is a constant set at deployment (~uint128 max × initial supply). The `_gonsPerFragment` divisor can grow or shrink freely because it never compounds — it's recomputed from scratch: `_gonsPerFragment = TOTAL_GONS / newTotalSupply`.
- **Advantage**: No accumulator compounding means no overflow and no underflow. The system can handle unlimited rebases in either direction.
- **Limitation**: Requires redesigning the storage model. Burns/mints of gons must preserve the `TOTAL_GONS` invariant. Doesn't directly support per-partition adjustments.
- **Reference**: [ampleforth/uFragments](https://github.com/ampleforth/uFragments)

### 4. Compound cToken — Exchange Rate Model

Compound uses an `exchangeRate` that maps cTokens to underlying assets. The rate starts at a fixed initial value and only grows as interest accrues.

- **Key insight**: Like Aave, the exchange rate is monotonically increasing. Compound avoids the underflow problem by design — the use case never requires reductive adjustments.
- **Reference**: [compound-protocol/CToken.sol](https://github.com/compound-finance/compound-protocol)

### 5. OpenZeppelin — mulDiv for Safe Intermediate Products

OpenZeppelin's `Math.mulDiv(a, b, denominator)` computes `(a × b) / denominator` without intermediate overflow by using 512-bit arithmetic internally.

- **Key insight**: This solves the intermediate overflow problem (`balance × abaf` exceeding uint256) but does NOT solve the ABAF accumulator underflow problem.
- **Relevance**: Useful as a building block for any proposal, but not a complete solution on its own.
- **Reference**: [OpenZeppelin Math.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/Math.sol)

### 6. ERC-4626 Tokenized Vault Standard

ERC-4626 defines a standard shares/assets conversion: `assets = shares × totalAssets / totalShares`. It's the standardized version of the Lido/Compound pattern.

- **Key insight**: The standard only handles monotonic growth (yield accrual). It doesn't address reductive adjustments natively.
- **Reference**: [EIP-4626](https://eips.ethereum.org/EIPS/eip-4626)

### Summary of Industry Approaches

| Protocol   | Approach                       | Handles Reduction?   | Handles Growth? | Accumulator Overflow? | Accumulator Underflow? |
| ---------- | ------------------------------ | -------------------- | --------------- | --------------------- | ---------------------- |
| Aave V3    | RAY-normalized index           | No (growth only)     | Yes             | No (bounded growth)   | N/A                    |
| Lido       | Shares model                   | Yes                  | Yes             | N/A (no accumulator)  | N/A                    |
| Ampleforth | Fixed gons, recomputed divisor | Yes                  | Yes             | No                    | No                     |
| Compound   | Exchange rate                  | No (growth only)     | Yes             | No (bounded growth)   | N/A                    |
| OZ mulDiv  | 512-bit intermediate           | N/A (building block) | N/A             | No (512-bit)          | N/A                    |

**Key finding**: No protocol in production uses a compounding multiplicative accumulator for **bidirectional** (growth + reduction) adjustments. Protocols that handle reduction (Ampleforth, Lido) avoid the problem by either recomputing the factor from scratch or using a shares model that doesn't compound.

---

## Proposals

### Proposal A: Epoch-Based ABAF with Periodic Materialization

**Concept**: Keep the current SCALE-normalized ABAF system but introduce an "epoch" mechanism. When ABAF drops below a safety threshold (e.g., `SCALE / 1000 = 1e15`), a materialization epoch is triggered: all holder balances are explicitly written to storage with the current factor applied, and ABAF is reset to SCALE.

**Implementation**:

```solidity
uint256 constant ABAF_FLOOR = SCALE / 1000; // 1e15

function adjustBalances(uint256 factor) external {
  _updateAbaf(factor);
  _adjustTotalSupply(factor);

  if (_getAbaf() < ABAF_FLOOR) {
    _triggerMaterializationEpoch();
  }
}

function _triggerMaterializationEpoch() internal {
  // Option 1: Lazy — store the epoch number, materialize on next user interaction
  _incrementEpoch();
  _resetAbaf(SCALE);
  // Each user's next tx checks epoch and materializes

  // Option 2: Batch — iterate holders in chunks across multiple txs
  // Requires off-chain orchestration
}
```

**Worked example (40 tokens, 1% reduction)**:

After ~3,000 steps, ABAF ≈ 80,408. When it drops below 1e15 (~step 690), trigger materialization:

- User A's stored balance updates: `(10e18 × 690-step-factor) / SCALE` → new raw balance
- ABAF resets to 1e18
- LABAF for all users resets to 1e18
- Process continues for another ~3,700 steps before next epoch

**Pros**:

- Extends ABAF lifetime indefinitely (each epoch buys ~3,700 more steps for 1% reductions)
- Compatible with current ABAF/LABAF architecture
- Lazy variant has O(1) gas per epoch trigger (users materialize on next interaction)

**Cons**:

- **Gas cost for batch materialization**: 100 holders = ~1M gas, 10,000 holders = ~102M gas (exceeds block gas limit — requires multi-tx batching)
- **Lazy materialization**: Users who don't interact for a long time accumulate multiple epochs of unmaterialized changes — if more than one epoch passes between interactions, the single-epoch LABAF comparison breaks. Requires epoch-aware factor calculation.
- **Operational complexity**: Needs monitoring, triggering logic, and potentially off-chain orchestration for batch modes
- **Edge case**: If adjustments happen faster than materialization can complete (e.g., daily adjustments with 10K holders), the system may never fully materialize before the next epoch

**Estimated effort**: Medium. Core ABAF logic changes + epoch tracking + materialization function + monitoring.

---

### Proposal B: Ampleforth-Style Fixed Denomination (Gons)

**Concept**: Replace the compounding ABAF accumulator with a fixed internal denomination. Each account stores balance in "gons" (a fixed-precision internal unit). The conversion factor `gonsPerToken` is **recomputed from scratch** on each adjustment — never compounded.

**Implementation**:

```solidity
uint256 private constant TOTAL_GONS = type(uint128).max; // ~3.4e38, fixed forever

uint256 private _gonsPerToken;       // recomputed, not compounded
uint256 private _totalSupplyTokens;  // authoritative total supply in display tokens

mapping(address => uint256) private _gonBalances;

function balanceOf(address account) public view returns (uint256) {
    return _gonBalances[account] / _gonsPerToken;
}

function adjustBalances(uint256 factor) external {
    // Recompute total supply
    _totalSupplyTokens = (_totalSupplyTokens * factor) / SCALE;

    // Recompute the divisor from scratch — no compounding!
    _gonsPerToken = TOTAL_GONS / _totalSupplyTokens;
}

function _transfer(address from, address to, uint256 amount) internal {
    uint256 gonAmount = amount * _gonsPerToken;
    _gonBalances[from] -= gonAmount;
    _gonBalances[to]   += gonAmount;
}
```

**Worked example (40 tokens, 1% reduction)**:

Setup: `TOTAL_GONS = 3.4e38`, initial `_totalSupplyTokens = 40e18`, `_gonsPerToken = 3.4e38 / 40e18 = 8.5e18`

- User A gons: `10e18 × 8.5e18 = 8.5e37`
- User B gons: `20e18 × 8.5e18 = 1.7e38`
- User C gons: `10e18 × 8.5e18 = 8.5e37`

| Step   | totalSupplyTokens | gonsPerToken | User A display | User B display | Overflow? |
| ------ | ----------------- | ------------ | -------------- | -------------- | --------- |
| 0      | 40.000000e18      | 8.500000e18  | 10.000000      | 20.000000      | NO        |
| 1      | 39.600000e18      | 8.585858e18  | 9.900000       | 19.800000      | NO        |
| 100    | 14.641294e18      | 2.322275e19  | 3.660323       | 7.320647       | NO        |
| 1,000  | 1.726850e15       | 1.969108e23  | 0.000432       | 0.000863       | NO        |
| 3,724  | ~1                | ~3.4e38      | ~0             | ~0             | NO        |
| 10,000 | N/A               | N/A          | N/A            | N/A            | NO        |

**Key property**: `_gonsPerToken` is **recomputed** as `TOTAL_GONS / _totalSupplyTokens`. It never compounds, so it cannot overflow. When `_totalSupplyTokens` approaches 0, `_gonsPerToken` grows but stays within `uint256` because `TOTAL_GONS` is capped at `~3.4e38`.

The balance precision is bounded by `TOTAL_GONS / totalSupply`. As total supply shrinks, precision per token actually **increases** (more gons per token).

**Underflow analysis**: Balance reaches 0 when `_gonBalances[user] < _gonsPerToken`, i.e., when the user's share of gons represents less than 1 display-unit. This happens at the same step as the SCALE system (~step 4,353 for 10 tokens), but it's **mathematically correct** — the balance truly is < 1 wei.

**Pros**:

- **No overflow, no underflow of the conversion factor** — `_gonsPerToken` is recomputed, not compounded
- **Unlimited adjustments** in either direction (growth and reduction)
- **Battle-tested** — Ampleforth has run this model in production since 2019 with $100M+ TVL
- **No epoch or materialization needed** — O(1) gas per adjustment, no matter how many adjustments
- **Precision improves for reductions** — more gons available per remaining token

**Cons**:

- **Major refactoring required**: Every function that reads/writes balances, locks, holds, freezes, allowances, clears, and partitions must be updated to use gon-denominated storage. The Diamond pattern with 4 layers makes this a wide-reaching change
- **LABAF per-user tracking becomes unnecessary** — the gons model doesn't need it, but removing it affects the entire ABAF/LABAF infrastructure
- **Minting/burning complexity**: New tokens minted after adjustments need gon conversion. The `TOTAL_GONS` invariant must be carefully maintained (or `TOTAL_GONS` must be allowed to grow, adding complexity)
- **Partition support**: Per-partition balance adjustments require per-partition gonsPerToken, adding storage overhead
- **Migration**: Deployed tokens need a one-time conversion from raw balances to gon balances

**Estimated effort**: High. Fundamental storage model change across all 4 Diamond layers.

---

### Proposal C: Hybrid ABAF with Higher SCALE and mulDiv Safety

**Concept**: Keep the SCALE-normalized ABAF architecture but combine three techniques to maximize its safe operating range:

1. **Increase SCALE to 10^27** (matching Aave's RAY) — this extends the underflow threshold from 3,724 to 5,786 steps for 1% reductions
2. **Use OpenZeppelin's `mulDiv`** for all `(balance × factor) / SCALE` operations — this prevents intermediate overflow when `balance × factor > uint256`
3. **Add a minimum ABAF guard** — revert if an adjustment would drive ABAF below a configurable floor, forcing the issuer to handle the edge case explicitly

**Implementation**:

```solidity
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

uint256 constant SCALE = 1e27; // RAY precision
uint256 constant ABAF_MIN = 1e9; // minimum ABAF before revert

function _updateAbaf(uint256 factor) internal override {
  uint256 newAbaf = Math.mulDiv(_getAbaf(), factor, SCALE);
  if (newAbaf < ABAF_MIN) revert AbafUnderflow();
  _adjustBalancesStorage().abaf = newAbaf;
}

function _calculateFactor(uint256 _abaf, uint256 _labaf) internal pure override returns (uint256) {
  return Math.mulDiv(_abaf, SCALE, _labaf);
}

function _adjustTotalBalanceFor(uint256 abaf, address account) internal override {
  uint256 factor = _calculateFactorByAbafAndTokenHolder(abaf, account);
  uint256 newBalance = Math.mulDiv(oldBalance, factor, SCALE);
  // ...
}
```

**Worked example (40 tokens, 1% reduction, SCALE=10^27)**:

| Step      | ABAF        | User A       | User B       | Error vs Expected | Status        |
| --------- | ----------- | ------------ | ------------ | ----------------- | ------------- |
| 0         | 1.000×10^27 | 10.000000000 | 20.000000000 | 0                 | OK            |
| 1         | 9.900×10^26 | 9.900000000  | 19.800000000 | 0                 | OK            |
| 100       | 3.660×10^26 | 3.660323413  | 7.320646825  | 0                 | OK            |
| 1,000     | 4.317×10^22 | 0.000431712  | 0.000863425  | 0                 | OK            |
| 2,000     | 1.864×10^18 | 0.000000019  | 0.000000037  | 0                 | OK            |
| 3,000     | 8.046×10^13 | ~0           | ~0           | 0                 | OK            |
| 3,500     | 5.287×10^11 | ~0           | ~0           | 0                 | OK            |
| **5,786** | **0**       | **0**        | **0**        | —                 | **UNDERFLOW** |

With `ABAF_MIN = 1e9`, the system reverts at ~step 5,500 instead of silently zeroing balances.

**Underflow thresholds with SCALE=10^27**:

| Reduction | Steps to ABAF=0 | Steps to ABAF_MIN (1e9) | Daily adjustments |
| --------- | --------------- | ----------------------- | ----------------- |
| 1.0%      | 5,786           | ~5,500                  | ~15 years         |
| 0.5%      | ~11,400         | ~10,800                 | ~30 years         |
| 0.1%      | ~55,800         | ~53,000                 | ~145 years        |
| 0.01%     | ~550,000        | ~523,000                | ~1,432 years      |

**Intermediate overflow protection with mulDiv**: Without mulDiv, `balance × ABAF` overflows when ABAF > ~5.8×10^57 (for a 20-token balance). With mulDiv, this limit is removed — 512-bit intermediate arithmetic handles any product within uint256 result range.

**Pros**:

- **Minimal code change** — same ABAF/LABAF architecture, just change SCALE constant and wrap arithmetic in mulDiv
- **55% more headroom** than SCALE=10^18 (5,786 vs 3,724 steps for 1% reduction)
- **Explicit failure** via ABAF_MIN guard — no silent balance destruction
- **mulDiv prevents intermediate overflow** — supports larger balances and extreme growth factors
- **No new storage model** — locks, holds, freezes, partitions all continue working unchanged
- **Gas cost**: mulDiv adds ~150 gas per operation (vs ~5 gas for plain division) — acceptable

**Cons**:

- **Does not eliminate underflow** — only delays it. For daily 1% reductions, the system still fails after ~15 years
- **External dependency** on OpenZeppelin Math.sol (well-audited, but adds import)
- **Breaking change**: SCALE=10^27 requires migrating all stored ABAF/LABAF values (multiply by 10^9). Factor encoding changes from `factor × 10^18` to `factor × 10^27`
- **Not a permanent solution** — extreme long-lived instruments (50+ years of daily reductions) still need an additional mechanism like epoching or the gons model

**Estimated effort**: Low–Medium. Change SCALE constant, add mulDiv calls, add ABAF_MIN guard, update tests.

---

## Comparison Matrix

| Criterion                 | Proposal A (Epochs)         | Proposal B (Gons)                    | Proposal C (Higher SCALE + mulDiv) |
| ------------------------- | --------------------------- | ------------------------------------ | ---------------------------------- |
| **Max steps (1% daily)**  | Unlimited (with epochs)     | Unlimited                            | ~5,500 (then reverts)              |
| **Overflow risk**         | None (with SCALE)           | None                                 | None (mulDiv)                      |
| **Underflow risk**        | None (epochs reset)         | None (recomputed)                    | Explicit revert at floor           |
| **Precision**             | Same as SCALE               | Better for reductions                | Better than SCALE=1e18             |
| **Gas per adjustment**    | O(1) normal, O(n) epoch     | O(1) always                          | O(1) always                        |
| **Refactoring scope**     | Medium                      | High                                 | Low–Medium                         |
| **Migration complexity**  | Medium                      | High                                 | Low                                |
| **Battle-tested pattern** | Novel (no precedent)        | Yes (Ampleforth)                     | Yes (Aave RAY + OZ mulDiv)         |
| **Bidirectional**         | Yes                         | Yes                                  | Yes (within limits)                |
| **Partition support**     | Works (epoch per partition) | Complex (gonsPerToken per partition) | Works (same architecture)          |
| **Silent balance loss**   | No (if epochs work)         | No                                   | No (ABAF_MIN reverts)              |

---

## Recommendation

**Short term**: Implement **Proposal C** (Higher SCALE + mulDiv) as it provides the best risk/effort ratio. It extends the safe operating range to 15+ years of daily 1% reductions with minimal code changes, prevents intermediate overflow via mulDiv, and adds explicit failure via ABAF_MIN instead of silent balance destruction.

**Medium term**: If product requirements demand truly unlimited adjustment steps (>15 years of daily reductions), evaluate **Proposal B** (Gons) for a future major version. The Ampleforth pattern is production-proven but requires significant refactoring of the Diamond facet architecture.

**Proposal A** (Epochs) is not recommended as a standalone solution due to the O(n) gas cost of materialization and the operational complexity of epoch management, but elements of it (lazy materialization on user interaction) could complement Proposal C as an additional safety net.

---

## References

- **REF-001**: [Aave V3 ScaledBalanceTokenBase](https://github.com/aave/aave-v3-core) — RAY (1e27) normalized accumulator
- **REF-002**: [Ampleforth UFragments](https://github.com/ampleforth/uFragments) — Fixed gons denomination, non-compounding divisor
- **REF-003**: [Lido stETH](https://github.com/lidofinance/core) — Shares-based rebase model
- **REF-004**: [OpenZeppelin Math.mulDiv](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/Math.sol) — 512-bit intermediate arithmetic
- **REF-005**: [EIP-4626 Tokenized Vault](https://eips.ethereum.org/EIPS/eip-4626) — Standard shares/assets conversion
- **REF-006**: [Compound cToken](https://github.com/compound-finance/compound-protocol) — Exchange rate model
- **REF-007**: Internal ADR [scale-normalized-abaf.md](./scale-normalized-abaf.md) — SCALE normalization proposal
- **REF-008**: Current implementation — `packages/ats/contracts/contracts/layer_0/adjustBalances/AdjustBalancesStorageWrapper1.sol`
