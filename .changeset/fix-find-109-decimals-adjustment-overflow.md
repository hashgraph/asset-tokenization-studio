---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-109: guard `DecimalsLib.calculateDecimalsAdjustment` against arithmetic overflow.

Two overflow scenarios were unguarded in the multiplication path (`_newDecimals > _decimals`):

1. **Exponent overflow** — `10 ** decimalsDiff` wraps silently when `decimalsDiff >= 78`, because `uint256` can represent at most ~1.157 × 10^77. An explicit check `if (decimalsDiff >= MAX_DECIMALS) revert DecimalsTooLarge(_newDecimals)` now fires before `_pow10` is ever called with an out-of-range exponent.

2. **Multiplication overflow** — even with a valid exponent, `_amount * multiplier` can exceed `uint256.max` when `_amount` is large. A second guard `if (_amount > MAX_UINT256 / multiplier) revert DecimalsTooLarge(_newDecimals)` catches this by checking the inverse inequality before multiplying.

As secondary improvements:

- The exponent guard is ordered before `_pow10` is called, so `_pow10` is never invoked with a wrapped exponent even on the revert path.
- The result of `_pow10(decimalsDiff)` is cached in `multiplier` and reused for both the overflow check and the multiplication, eliminating a redundant call.
- The multiplication itself is wrapped in `unchecked` since overflow is proven impossible at that point, saving the Solidity-generated overflow check.
