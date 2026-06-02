---
"@hashgraph/asset-tokenization-contracts": patch
---

Add `checkExponentOverflow` guard to `DecimalsLib` and apply it in `BondStorageWrapper`, `DividendStorageWrapper` and `CouponStorageWrapper`.

- Introduces `ICommonErrors.ExponentOverflow(uint256 exponent)` for cases where `10 ** exponent` would overflow `uint256` (exponent ≥ 78).
- `DecimalsLib.checkExponentOverflow` replaces the previous `checkDecimalsOverflow`, fixing an off-by-one (`>` → `>=`) that silently allowed exponent 78 through to `pow10`.
- `CouponStorageWrapper._calculateCouponAmount` widens `totalDecimals` from `uint8` to `uint256` before the guard, preventing silent wrap-around when `decimals + rateDecimals` exceeds 255.
