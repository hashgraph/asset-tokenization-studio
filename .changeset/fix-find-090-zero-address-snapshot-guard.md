---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-090: guard against `address(0)` reaching snapshot and batch state-writing functions. `SnapshotsStorageWrapper.updateAccountSnapshot` wrote a snapshot entry unconditionally, so the clearing-creation functions (which pass `address(0)` as the destination at creation) produced phantom `address(0)` snapshot entries when a snapshot was active; `BatchFreeze` used the wrong validator (missing the zero-address check); and `batchTransfer` skipped the recipient `checkValidAddress` its single-call counterpart enforces. The fix adds an `address(0)` early-return to `updateAccountSnapshot`, corrects the `BatchFreeze` validator, and adds `checkValidAddress` to the `batchTransfer` recipient loop.
