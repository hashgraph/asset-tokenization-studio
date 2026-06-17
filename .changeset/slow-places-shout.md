---
"@hashgraph/asset-tokenization-contracts": minor
---

Add irreversible token deactivation via a new `DeactivateFacet`. Once `deactivate()` is called by a holder of the new `DEACTIVATE_ROLE`, every operation guarded by the new `onlyActivated` modifier reverts with `Deactivated`; the transition is one-way, with no reactivate counterpart. The facet exposes `deactivate()` and `isDeactivated()`, backed by a dedicated `DeactivateStorageWrapper` slot and a `DeactivateModifiers` mix-in wired into `CoreModifiers` so the guard reaches all core facets. Adds the `DEACTIVATE_ROLE` constant and storage slot, exposes `IDeactivate` on `IAsset`, registers the facet in all bond/equity/loan-portfolio configurations, and adds integration coverage.
