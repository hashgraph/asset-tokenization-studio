---
"@hashgraph/asset-tokenization-contracts": major
---

Extract `lockedBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into a new
`LockAtSnapshotByPartitionFacet` registered under `_LOCK_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.
All token configurations include the new facet. `ISnapshots` no longer declares
`lockedBalanceOfAtSnapshotByPartition`; `IAsset` now inherits `ILockAtSnapshotByPartition`.
