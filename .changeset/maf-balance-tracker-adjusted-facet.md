---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `balanceOfAt` from `ERC1410ReadFacet` into a dedicated `BalanceTrackerAdjustedFacet`; `IAsset` exposes it via `IBalanceTrackerAdjusted`.

Non-breaking: the 4-byte selector is unchanged, so calls through `IAsset` continue to work without modification.
