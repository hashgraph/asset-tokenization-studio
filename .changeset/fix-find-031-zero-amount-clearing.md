---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-031: clearing transfer and redeem creation entry points did not validate that `_amount > 0`, allowing zero-amount operations that increment storage counters and pollute on-chain state with no economic effect. Add `InvalidClearingAmount` custom error to `IClearingTypes`, add `checkNonZeroClearingAmount` helper to `ClearingStorageWrapper`, and call it as the first guard in `ClearingOps.clearingTransferCreation` and `ClearingOps.clearingRedeemCreation`.
