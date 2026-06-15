---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `balanceOfAtSnapshotByPartition` and `totalSupplyAtSnapshotByPartition` from `SnapshotsFacet` into a dedicated `BalanceTrackerAtSnapshotByPartitionFacet`.

Non-breaking: the 4-byte selectors of both methods are unchanged, so calls through `IAsset` continue to work without modification.
