---
"@hashgraph/asset-tokenization-contracts": minor
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

**Dead code removed — direct consequence of `performTransfer` centralisation**
`TokenCoreOps` exposed three public passthroughs (`reduceBalanceByPartition`, `increaseBalanceByPartition`, `addPartitionTo`) that were labelled "for ClearingOps" but had zero callers after the centralisation. The corresponding `internal` wrappers in `ERC1410StorageWrapper` (`reduceBalanceByPartition`, `increaseBalanceByPartition`, `addPartitionTo`) and `ERC3643StorageWrapper.transferFrozenBalance` — which called `increaseBalance` directly, bypassing `performTransfer` and therefore emitting no `Transfer` event — were also removed.

**Least-privilege visibility (`internal` → `private`)**
`ERC3643StorageWrapper._transferFrozenBalanceOnly` and `ERC1410StorageWrapper.deletePartitionForHolder` are only ever called within their own file. Both are now `private`, following the least-privilege rule and matching the project's existing naming convention for private helpers.

**`msg.sender` replaced with `EvmAccessors.getMsgSender()` across production facets**
Five direct uses of `msg.sender` in `Burn.sol` (`redeem`, `redeemFrom`), `Transfer.sol` (`transferFromWithData`), and `Compliance.sol` (`canTransfer`) bypassed the EVM accessor wrapper layer. All five are replaced with `EvmAccessors.getMsgSender()`. `Compliance.sol` also receives the missing `EvmAccessors` import.

**Regression tests**
Covers `burnByPartition`, `mintByPartition`, `clearingByPartition`, `lockByPartition`, `transferAndLock`, `operatorClearingHoldByPartition`, `protectedHoldByPartition`, `transferWithData`, `transferFromWithData`, and all batch variants — asserting exactly one `Transfer` event per operation.
