---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/mass-payout-contracts": patch
---

Centralise facet initialisation, add an `onlyOperational` gate, and rename resolver keys (BBND-1688). All facets adopt the `InitializerStorageWrapper` pattern (admin-gated, `onlyFacetNotRegistered` → `setFacetToReady` → emit `XxxInitialized`, reverting `FacetAlreadyRegistered` thereafter), ~70 facets that lacked an initialisation guard gain one, every state-changing function gets the `onlyOperational` gate, and resolver keys are renamed from `_XXX_RESOLVER_KEY` to `RESOLVER_KEY_XXX` and moved onto each facet's interface.

Breaking: state-changing functions revert with `AssetNotOperational` until fully initialised; `SecurityModifiers`/`onlyNotSecurityInitialized` and `IClearingActions` are removed (use `IClearing`/`ClearingFacet`); all `_XXX_RESOLVER_KEY` constants are renamed and relocated; and `applyRoles` becomes `void` with two new `RolesApplied` parameters.
