---
"@hashgraph/asset-tokenization-contracts": patch
---

Consolidate the three structurally identical `TransferAndLock` facet variants into one. `TransferAndLockFacet`, `TransferAndLockFixedRateFacet`, and `TransferAndLockKpiLinkedRateFacet` differed only by the resolver key they returned, and all asset configurations already referenced the base `TransferAndLockFacet` (the rate-variant keys had no runtime consumers). The base facet is promoted to `transferAndLock/TransferAndLockFacet.sol`, the `fixedRate`/`kpiLinkedRate` variant facets are deleted, the stale `orchestratorLibraries.ts` entries (also missing the required `tokenCoreOps` dependency) are removed, and the registry is regenerated.
