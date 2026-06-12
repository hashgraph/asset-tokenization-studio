---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-053: guard against `uint256` overflow in the dividend-amount calculation for large holdings. `DividendStorageWrapper.getDividendAmountFor` computed the numerator as a direct `tokenBalance * amount`, which could overflow for institutional balances or high-precision amounts and permanently revert every view and claim on that path. It now uses `Math.mulDiv` for 512-bit intermediate precision while folding the token-decimal scale into the divisor; the result is mathematically equivalent and the public `DividendAmountFor` API is preserved, so off-chain consumers are unaffected.
