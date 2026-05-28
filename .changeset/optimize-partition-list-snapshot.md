---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: [FIND-005] make the per-holder partition-list snapshot O(1) per mutation to close a partition-spam denial-of-service.

`SnapshotsStorageWrapper` snapshotted a holder's partition list by copying the whole `partitionsOf(holder)` array into a single `accountPartitionMetadata[holder]` entry (`PartitionSnapshots` holding a `ListOfPartitions`). Each capture was O(N) in the holder's partition count: one cold SSTORE (~22,100 gas) per `bytes32` element, plus the O(N) `partitionsOf` SLOAD pass. Because anyone can grow a victim's `partitions[]` array by sending 1 wei under a fresh partition id, an attacker could inflate the list until any operation that captured it exceeded the block gas limit, permanently bricking the victim's transfers and redemptions.

The list snapshot is now stored per array index, mirroring the existing security-holders snapshot pattern (`tokenHoldersSnapshots`):

- `accountPartitionMetadata`, `PartitionSnapshots` and `ListOfPartitions` are removed. New storage holds `accountPartitionsByIndexSnapshots[holder][index]` (a `SnapshotsBytes32` history of the partition id living at each slot) and `accountTotalPartitionsSnapshots[holder]` (a `Snapshots` history of the list length). `SnapshotsBytes32` and the `updateSnapshotBytes32` / `bytes32ValueAt` primitives are added alongside their `address` counterparts.
- `ERC1410StorageWrapper.addPartitionToOnly` captures only the pre-push length via `updateTotalPartitionsSnapshot`; the freshly appended slot needs no per-index capture. `deletePartitionForHolder` captures the length plus the two slots about to lose their value (the swapped-into index and the popped tail index) via `updatePartitionAtIndexSnapshot`, before the swap-and-pop. Every mutation now writes at most three slots regardless of N.
- `partitionsOfAtSnapshot` reconstructs the list slot-by-slot: it reads the historical length, then for each index resolves the per-index history, falling back to the live `partitions[holder]` slot when no capture exists at that snapshot. The reader stays `view`, so the O(N) reconstruction is never paid by an on-chain mutation.

Historical reads are unchanged in behaviour. New integration tests in `snapshotsByPartition.test.ts` cover the previously untested delete path: removing a middle partition (swap branch), removing the last partition (no-swap branch), and multiple removals within a single snapshot (idempotency), each asserting that earlier snapshots still return the pre-mutation list.
