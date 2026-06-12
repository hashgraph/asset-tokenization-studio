---
"@hashgraph/asset-tokenization-contracts": major
---

Rename the `KpiLinkedRate` facet externals to disambiguate them from `SustainabilityPerformanceTargetRate` (BBND-1731): `getImpactData`, `getInterestRate`, `setImpactData` and `setInterestRate` gain a `KpiLinkedRate` prefix and `initialize_KpiLinkedRate` becomes `initializeKpiLinkedRate`. `IKpiLinkedRate` now joins the `IAsset` umbrella, since the rename resolves its prior four-selector collision with `ISustainabilityPerformanceTargetRate`.

Breaking: the renamed methods get new selectors, so external integrators calling the old names on a `KpiLinkedRate`-bearing diamond must migrate to the prefixed names. Events and shared structs are unchanged, and the SDK port-in API is unchanged (its adapters bridge the rename internally).
