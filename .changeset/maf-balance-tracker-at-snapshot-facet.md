---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `balanceOfAtSnapshot`, `balancesOfAtSnapshot` and `totalSupplyAtSnapshot` from `SnapshotsFacet` into a dedicated `BalanceTrackerAtSnapshotFacet`.

Non-breaking: the 4-byte selectors of the three methods are unchanged, so calls through `IAsset` continue to work without modification.
