---
"@hashgraph/asset-tokenization-contracts": patch
---

Reduce GAS_LIMIT constants, consolidate initializer storage helpers, and add NatSpec
documentation.

- reduce `GAS_LIMIT` values in `constants.ts`: `max` 30 M → 15 M, `default` 5 M → 3 M,
  `high` 20 M → 10 M, `businessLogicResolver.initialize` 15 M → 8 M,
  `registerBusinessLogics` 10 M → 7.8 M, `createConfiguration` 20 M → 15 M
- merge `initializeInitializer` and `updateMaxInitializerFacetIndex` into a single
  `setMaxInitializerFacetIndex` in `InitializerStorageWrapper`; make `initializerStorage()`
  private to prevent direct access from inheriting contracts
- add `configureYulOptimizer: true` to `.solcover.js` to fix coverage-collection failures
  caused by the Yul optimiser pipeline
- add NatSpec to all four modifiers in `InitializerModifiers` and to two view functions in
  `DiamondCutManager` / `DiamondCutManagerWrapper`
- add `mockFacet1NotReadyMethod` to `MockFacet1` and extend integration tests to cover
  previously unreached branches in `InitializerStorageWrapper` and `DiamondCutManagerWrapper`
