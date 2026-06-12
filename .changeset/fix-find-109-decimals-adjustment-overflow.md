---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-109: guard `DecimalsLib.calculateDecimalsAdjustment` against arithmetic overflow on the scale-up path. Two scenarios were unguarded: `10 ** decimalsDiff` wrapping when `decimalsDiff >= 78`, and `_amount * multiplier` exceeding `uint256.max` for large amounts. Both now revert with `DecimalsTooLarge` before the unsafe operation (the exponent check runs before `_pow10` is ever called), the computed multiplier is cached and reused, and the now-provably-safe multiplication is wrapped in `unchecked`.
