---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-109: guard against arithmetic overflow in `DecimalsLib.calculateDecimalsAdjustment`.

`calculateDecimalsAdjustment` computed `10 ** (_decimals - _newDecimals)` or `10 ** (_newDecimals - _decimals)` without bounding the exponent. Since `uint256` can hold at most ~1.16 × 10^77, any decimal difference ≥ 78 causes `10 ** diff` to overflow, resulting in an opaque arithmetic panic rather than a meaningful error.

The fix adds an explicit check before each exponentiation: if the difference between the two decimal values is ≥ 78, the function reverts with `DecimalDifferenceTooLarge(smallerDecimals, biggerDecimals)`.

As a secondary improvement, the `diff` value is now cached in a local variable and reused for both the bounds check and the exponentiation, eliminating a redundant subtraction that the original implementation performed twice.
