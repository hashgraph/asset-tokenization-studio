---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix ERC-20 Transfer event compliance and centralise balance mutation logic.

**Missing Transfer event on partition-based operations (`ERC1410StorageWrapper`)**
EIP-20 requires a `Transfer` event for every balance change. `ERC1410StorageWrapper` was emitting `TransferByPartition` without the mandatory ERC-20 `Transfer`, breaking off-chain indexer traceability. Adds the missing emit and regression tests for `batchBurn`, `batchMint`, `batchTransfer`, `batchForcedTransfer`, `batchFreeze`, and `batchUnfreeze`.

**Duplicate Transfer emissions removed from mint/burn facets**
`BatchBurn`, `Burn`, `BatchMint`, and `Mint` were re-emitting `Transfer` after `TokenCoreOps` had already fired it internally, producing duplicate logs on every operation. Removes the redundant `emit` calls and the now-unused `ITransfer` imports from all four facets.

**Duplicate Transfer emissions removed from `ERC20StorageWrapper`**
After `ERC1410StorageWrapper` became the single emitter for partition paths, the two `emit ITransfer.Transfer` calls inside `ERC20StorageWrapper.transfer` and `ERC20StorageWrapper.transferFrom` became redundant and were removed.

**Centralised balance mutation via `ERC20StorageWrapper.performTransfer`**
Introduces `performTransfer(from, to, amount)` as the single internal function responsible for both balance accounting and `Transfer` event emission. Extracts `_reducePartitionOnly`, `_increasePartitionOnly`, and `_addPartitionToOnly` from `ERC1410StorageWrapper` so callers can mutate partition state without touching ERC-20 storage. All call sites in `ERC1410StorageWrapper`, `ERC3643StorageWrapper`, `ClearingOps`, `HoldStorageWrapper`, `LockStorageWrapper`, and `TokenCoreOps` are updated to route through `performTransfer`.

**Regression tests**
Covers `burnByPartition`, `mintByPartition`, `clearingByPartition`, `lockByPartition`, `transferAndLock`, `operatorClearingHoldByPartition`, `protectedHoldByPartition`, `transferWithData`, `transferFromWithData`, and all batch variants — asserting exactly one `Transfer` event per operation.
