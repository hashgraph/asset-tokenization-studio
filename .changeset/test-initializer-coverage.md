---
"@hashgraph/asset-tokenization-contracts": major
---

Harden the Initializer guards, remove stale modifier and utility contracts, and close branch-coverage gaps (BBND-1827). `initializeInitializer` and `updateMaxInitializerFacetIndex` now reject a zero max index, and `setOperationalStatus` now requires `DEFAULT_ADMIN_ROLE`. Removes the unused `BondModifiers`, `EquityModifiers`, `ContextProvider` and `LocalContext` contracts, and moves the bond-fixed-rate / KPI-linked-rate deploy surface off `IFactory` into a test-only `IMockFactory`.

Breaking: `setOperationalStatus` reverts for any caller without `DEFAULT_ADMIN_ROLE`; `ContextProvider`, `LocalContext` and `ProtectedPartitionRoleValidator` are removed (migrate to `EvmAccessors` and `ProtectedPartitionRoleValidatorModifiers`); and `IFactory.deployBondFixedRate`/`deployBondKpiLinkedRate` with their structs and events move to `IMockFactory`.
