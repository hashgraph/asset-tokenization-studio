---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `transferAndLockByPartition` from `TransferAndLock` into a dedicated `TransferAndLockByPartitionFacet`; the shared `PartitionTransferredAndLocked` event moves to `ITransferAndLockTypes`, inherited by both facets.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
