---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `frozenBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated `FreezeAtSnapshotFacet`; the partition-scoped `frozenBalanceOfAtSnapshotByPartition` stays in `SnapshotsFacet`.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
