---
"@hashgraph/asset-tokenization-contracts": minor
---

Add irreversible token deactivation via `DeactivateFacet`.

**New `DeactivateFacet` — one-way retirement of a security token**
Introduces a dedicated facet that permanently retires a token from active use. Once `deactivate()` is called by an account holding `DEACTIVATE_ROLE`, every operation guarded by `onlyActivated` reverts with `Deactivated`. The transition is intentionally one-way: there is no `reactivate` counterpart. The facet exposes two selectors: `deactivate()` and `isDeactivated()`.

**New `DeactivateStorageWrapper` — diamond storage for the deactivation flag**
Persists the deactivation state at a dedicated `_DEACTIVATE_STORAGE_POSITION` slot. Single-field struct (`bool deactivated`) designed for forward compatibility — future metadata (operator, timestamp, reason) can be appended without changing the slot. Provides `deactivate()`, `isDeactivated()`, and `requireActivated()` internals.

**New `DeactivateModifiers` + `onlyActivated` wired into `CoreModifiers`**
Adds the `onlyActivated` modifier as a reusable mix-in backed by `DeactivateStorageWrapper.requireActivated()`. `CoreModifiers` is updated to inherit `DeactivateModifiers`, making the guard available to all facets that already extend `CoreModifiers` without any further import changes.

**New `DEACTIVATE_ROLE` constant and storage slot**
`constants/roles.sol` and `constants/storagePositions.sol` receive the new `DEACTIVATE_ROLE` and `_DEACTIVATE_STORAGE_POSITION` entries. `IAsset.sol` is updated to expose the `IDeactivate` interface. The auto-generated `factory/ERC3643/interfaces/roles.sol` is regenerated accordingly.

**Registry and configuration updated**
`atsRegistry.data.ts` registers `DeactivateFacet` with its selectors. All existing `createConfiguration` scripts for bond, equity, and loan-portfolio token types are updated to include the new facet in the default diamond cut.

**Integration tests**
`deactivate.test.ts` covers: successful deactivation by role holder, revert on second call, revert when caller lacks `DEACTIVATE_ROLE`, revert on operations guarded by `onlyActivated` after deactivation, and `isDeactivated` read path.
