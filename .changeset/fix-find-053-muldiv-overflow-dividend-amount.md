---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: guard against `uint256` overflow in the dividend amount calculation for large institutional holdings.

`DividendStorageWrapper.getDividendAmountFor` computed the payable numerator as a direct `tokenBalance * amount` multiplication. For institutional holders with large balances or high-precision dividend amounts the intermediate product can exceed the `uint256` maximum (≈ 1.16 × 10^77), causing a permanent revert for every subsequent view and claim that exercises that path — permanently freezing dividend access for the affected holder.

The numerator is now computed via `Math.mulDiv(tokenBalance, amount, DecimalsLib.pow10(decimals))`, which performs the multiplication with 512-bit intermediate precision and folds the token-decimal scale into the division, keeping intermediate products bounded. The denominator is reduced to `DecimalsLib.pow10(amountDecimals)` accordingly. The resulting fraction is mathematically equivalent to the previous `(tokenBalance * amount) / 10^(decimals + amountDecimals)`.

The public `IDividendTypes.DividendAmountFor` API is preserved; only the internal decomposition of `numerator` / `denominator` changes, so off-chain consumers that divide the pair at presentation time remain compatible. Integration tests that asserted the previous literal decomposition were updated to the equivalent fraction.
