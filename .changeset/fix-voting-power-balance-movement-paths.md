---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix voting-power drift on four balance-movement paths that bypassed `ERC20VotesStorageWrapper.afterTokenTransfer`, so `DelegateVotesChanged` never fired and checkpoints diverged from the holder's controlled balance: hold execution (`HoldStorageWrapper.transferHold`), lock release (`LockStorageWrapper._releaseByPartition`), unfreeze (`ERC3643StorageWrapper.unfreezeTokensByPartition`), and clearing approval (`ClearingOps.transferClearingBalanceInternal`). All four now call `afterTokenTransfer` with the real `from`: cross-holder transfers correctly move voting power between delegates, while intra-holder bucket moves become no-ops. Using `address(0)` as before treated every restore as a mint, inflating delegate votes and total-supply checkpoints.
