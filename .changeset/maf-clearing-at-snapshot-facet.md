---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `clearedBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated `ClearingAtSnapshotFacet`; the partition-scoped `clearedBalanceOfAtSnapshotByPartition` is split separately.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
