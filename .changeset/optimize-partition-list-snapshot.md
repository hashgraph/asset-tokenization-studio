---
"@hashgraph/asset-tokenization-contracts": patch
---

Decouple the per-holder partition list snapshot from the balance-change hot path.

`SnapshotsStorageWrapper.updateAccountSnapshot` was invoked from `beforeTokenTransfer` on every transfer, issue, redeem, hold, lock and freeze flow. On each call, after a `takeSnapshot()` had advanced the current snapshot id, it read `ERC1410StorageWrapper.partitionsOf(account)` and pushed the full partition list of the touched holder into `accountPartitionMetadata[account]`. The cost was O(N) in the holder's partition count: roughly 22,100 gas per cold SSTORE per partition for the storage write, plus 2,100 gas per cold SLOAD for the prior `partitionsOf` pass. For a holder with N partitions, every "first balance change after takeSnapshot" paid ~24,000 × N extra gas — and the list was re-copied even when it had not changed since the previous snapshot. A holder of a multi-tranche token (for example a bond with N coupon partitions) paid this cost on every balance change throughout the life of the token.

The fix moves the partition-list snapshot to the two — and only two — places where the holder's partition list actually mutates:

- `ERC1410StorageWrapper.addPartitionToOnly` calls `SnapshotsStorageWrapper.updatePartitionListSnapshot(account)` before pushing the new entry into `partitions[account]`.
- `ERC1410StorageWrapper.deletePartitionForHolder` calls `updatePartitionListSnapshot(holder)` before the swap-and-pop.
