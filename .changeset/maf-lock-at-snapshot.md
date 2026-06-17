---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `lockedBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated `LockAtSnapshotFacet`; `IAsset` now inherits `ILockAtSnapshot`.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
