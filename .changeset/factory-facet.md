---
"@hashgraph/asset-tokenization-contracts": minor
---

Introduce `FactoryFacet`, moving the factory's deploy operations behind the diamond and registering them under new resolver keys. `DiamondCutManager` and the deployment workflows (`deploySystemWithNewBlr.ts`, `deploySystemWithExistingBlr.ts`) are updated for the facet-based factory, with a dedicated factory `createConfiguration.ts` and matching registry entry.
