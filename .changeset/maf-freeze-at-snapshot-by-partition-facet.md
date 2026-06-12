---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `frozenBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into a dedicated `FreezeAtSnapshotByPartitionFacet`; `IAsset` now also inherits `IFreezeAtSnapshotByPartition`.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
