---
"@hashgraph/asset-tokenization-contracts": major
---

refactor(contracts): harden Initializer guards, remove stale modifier and utility contracts, and close branch coverage gaps (BBND-1827).

Production code changes:

- `Initializer.initializeInitializer` and `Initializer.updateMaxInitializerFacetIndex` now revert
  with `ZeroValueNotAllowed` when called with `_maxInitializerFacetIndex == 0`; the `notZeroValue`
  modifier is applied at the function signature level.
- `Initializer.setOperationalStatus` now requires `DEFAULT_ADMIN_ROLE`; previously it had no access
  control gate, allowing any caller to trigger the operational-status transition.
- `BondModifiers.sol` and `EquityModifiers.sol` removed; all modifier logic they contained is now
  applied directly in the facets or is no longer needed after the centralised initialiser system.
- `ContextProvider.sol` and `LocalContext.sol` removed; the EVM-accessor wrappers they provided
  (`_msgSender`, `_blockTimestamp`, etc.) are now accessed directly from the `EvmAccessors` library
  and `TimeTravelStorageWrapper`; no concrete facet inherits these abstract contracts.

Test and mock changes:

- `upgradeMockFacet1AnyVersion()` added to `IMockFacet1` interface and `MockFacet1` contract; calls
  `onlyFacetRegistered` with an empty `_fromLastVersions` array, exercising the `if (length == 0) return`
  early-exit branch in `InitializerStorageWrapper.checkFacetRegistered`.
- `untested_initializers.test.ts` deleted; all 10 initialiser methods it covered have complete
  three-case tests (AccountHasNoRole, happy path, FacetAlreadyRegistered) in their respective
  facet test files, making the file pure duplication.

Breaking changes: `setOperationalStatus` now reverts for any caller without `DEFAULT_ADMIN_ROLE`.
`ContextProvider` and `LocalContext` are removed from the contract surface; any external project
that inherited these abstract contracts must migrate to direct library calls.
