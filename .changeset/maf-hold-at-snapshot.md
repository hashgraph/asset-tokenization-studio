---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `heldBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated `HoldAtSnapshotFacet`; `IAsset` now inherits `IHoldAtSnapshot`.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
