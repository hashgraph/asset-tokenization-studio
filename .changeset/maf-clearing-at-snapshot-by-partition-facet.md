---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `clearedBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into a dedicated `ClearingAtSnapshotByPartitionFacet`; the global `clearedBalanceOfAtSnapshot` stays in `SnapshotsFacet`.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
