---
"@hashgraph/asset-tokenization-contracts": patch
---

test(contracts): close branch coverage gaps in InitializerFacet and clean up redundant test file.

- add tests for the three uncovered branches in `Initializer.sol`: `ZeroValueNotAllowed` revert
  on `initializeInitializer(0)`, `ZeroValueNotAllowed` on `updateMaxInitializerFacetIndex(0)`,
  and `AccountHasNoRole` on `setOperationalStatus` called by a non-admin
- add test for the `if (length == 0) return` early-exit in
  `InitializerStorageWrapper.checkFacetRegistered` via a new `upgradeMockFacet1AnyVersion()`
  mock method that passes an empty `_fromLastVersions` array
- add test for `InitializerStorageWrapper.setConfigVersion` via `MockDiamondCut.forceNonOperational`,
  covering the remaining uncovered function and verifying that forcing non-operational state
  blocks `onlyOperational` guards
- fix `MockDiamondCut` BLR version reference in `deploySystemWithNewBlr.ts`: it occupies v2 of
  `RESOLVER_KEY_DIAMOND` (v1 is taken by `DiamondFacetTimeTravel`), so `INITIALIZE_MOCK_VERSION_MAPS`
  now pins it at `2` in both config versions
- delete `untested_initializers.test.ts`; all 10 initializer methods it covered have complete
  three-case tests in their respective facet test files, making the file pure duplication
