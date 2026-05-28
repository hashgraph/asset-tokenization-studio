---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/mass-payout-contracts": patch
---

refactor(contracts): centralised facet initialisation, `onlyOperational` gate, and resolver key rename (BBND-1688).

- `InitializerStorageWrapper` pattern applied to all facets: `onlyRole(DEFAULT_ADMIN_ROLE)` + `onlyFacetNotRegistered(RESOLVER_KEY_XXX)` → `setFacetToReady(RESOLVER_KEY_XXX)` → emit `XxxInitialized()`. Subsequent calls revert with `FacetAlreadyRegistered`.
- Existing boolean guards migrated: AccessControl, BondUSA (fixed/KPI/variable), Cap, CapByPartition, ControlList, EquityUSA, Security.
- `initializeXxx` added to ~70 facets that had no prior initialisation guard.
- Virtual resolver-key pattern (`_bondInitializerKey()`, `_transferAndLockInitializerKey()`, etc.) introduced for abstract base facets shared across multiple concrete types.
- `onlyOperational` gate added to all state-changing functions; `Factory._deploySecurity()` calls every initialiser before marking the proxy operational via `_SECURITY_FACETS_MAX`.
- Resolver keys renamed from `_XXX_RESOLVER_KEY` to `RESOLVER_KEY_XXX` and moved from `constants/resolverKeys.sol` to each facet's own interface file.
- `applyRoles` no longer returns `bool`; `RolesNotApplied` removed; `RolesApplied` gains `appliedRoles` + `appliedStates` parameters.
- Empty contracts removed: `AmortizationStorageWrapper.sol`, `LoanStorageWrapper.sol`, `NominalValueModifiers.sol`, `ERC20Modifiers.sol`, `ExternalListModifiers.sol`.
- Mass-payout: `AssetMock` gains `initializeBalanceAdjustments` stub.

Breaking changes: state-changing functions revert with `AssetNotOperational` until fully initialised. `SecurityModifiers.sol` and `onlyNotSecurityInitialized` removed. `IClearingActions` removed — use `IClearing`/`ClearingFacet`. All `_XXX_RESOLVER_KEY` constants renamed to `RESOLVER_KEY_XXX` and moved to interface files. `applyRoles` return type changed to `void`; `RolesApplied` event gains two new parameters.
