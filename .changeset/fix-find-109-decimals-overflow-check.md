---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-109: guard against arithmetic overflow in `DecimalsLib.calculateDecimalsAdjustment` and correct several related issues.

**Overflow guard on the division path.**
`calculateDecimalsAdjustment` already validated `_newDecimals < 78` before the multiplication branch, but the division branch (`_decimals > _newDecimals`) had no equivalent guard. When `_decimals - _newDecimals ≥ 78` the internal `_pow10` helper was called with an exponent that exceeds `uint256` capacity (`10^78 > type(uint256).max`), causing the computation to wrap silently in the `unchecked` block and return a meaningless result. An explicit check is now added before the division: if the difference is ≥ 78 the function reverts with `ICommonErrors.DecimalsTooLarge(_decimals)`.

**Corrected error argument on the multiplication path.**
The multiplication guard reverted with `DecimalsTooLarge(_decimals)` (the _old_ decimal count), making the error argument misleading. It now passes `_newDecimals`, which is the value that actually triggered the limit.

**Fixed import path.**
`DecimalsLib` imported `../../constants/values.sol` (resolving to the non-existent `infrastructure/constants/`) — the path is corrected to `../../constants/values.sol` relative to `infrastructure/utils/`.

**Corrected `_pow10` NatSpec.**
The doc-comment incorrectly stated that the function "uses a simple loop for exponents > 18" and "reverts with `ExponentTooLarge`". Neither is true: exponents above 18 fall through to the EVM `EXP` opcode, and the bounds check lives in `calculateDecimalsAdjustment`, not in `_pow10`. The comment has been rewritten to reflect the actual behaviour.

**Test suite fixes and coverage.**
`DecimalsLibMock` now inherits `ICommonErrors` so that `revertedWithCustomError` can resolve `DecimalsTooLarge` from the mock's ABI. Tests that referenced the non-existent error `DecimalDifferenceTooLarge` are corrected to `DecimalsTooLarge` with `.withArgs()` assertions. New cases cover the division-path overflow guard, the Yul switch fast-path (diff ≤ 18), the EXP fallback path (diff = 19), and zero-amount inputs, bringing the file to 100% branch coverage.
