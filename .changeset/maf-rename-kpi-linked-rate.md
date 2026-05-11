---
"@hashgraph/asset-tokenization-contracts": major
---

refactor(KpiLinkedRate): rename facet externals to disambiguate from `SustainabilityPerformanceTargetRate` (BBND-1731). The four `get`/`set` methods get a `KpiLinkedRate` prefix and the initialiser is camel-cased:

- `getImpactData` → `getKpiLinkedRateImpactData`
- `getInterestRate` → `getKpiLinkedRateInterestRate`
- `setImpactData` → `setKpiLinkedRateImpactData`
- `setInterestRate` → `setKpiLinkedRateInterestRate`
- `initialize_KpiLinkedRate` → `initializeKpiLinkedRate`

Events (`InterestRateUpdated`, `ImpactDataUpdated`) and shared structs (`InterestRate`, `ImpactData` on `IKpiLinkedRateErrors`) are unchanged. Selectors change because the canonical signatures change — external integrators calling the old method names on a `KpiLinkedRate`-bearing diamond must migrate to the prefixed names. SDK adapter call-sites (`RPCQueryAdapter`, `RPCTransactionAdapter`) are updated to bridge the rename internally; the SDK port-in API is unchanged.

Also fixes a latent bug in `tasks/compile.ts` `erc3643-clone-interfaces`: the regen was dropping the `is IKpiLinkedRateErrors` hierarchy from the T-REX shadow on every ABI-changing regen, leaving `InterestRate`/`ImpactData` out of scope. `IKpiLinkedRate` is now declared with `removeImports: false, removeHierarchy: false` and a companion `IKpiLinkedRateErrors` shadow is cloned.
