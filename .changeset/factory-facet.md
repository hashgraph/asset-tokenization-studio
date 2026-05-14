---
"@hashgraph/asset-tokenization-contracts": minor
---

Introduce FactoryFacet with enhanced factory capabilities for the asset tokenization system.

**Changes:**

- Added `FactoryFacet.sol` with new factory operations
- Updated `DiamondCutManager` and related interfaces for improved compatibility
- New resolver keys in `resolverKeys.sol`
- Refactored deployment workflows (`deploySystemWithNewBlr.ts`, `deploySystemWithExistingBlr.ts`) for better modularity
- New `createConfiguration.ts` for factory configuration setup
- Extended `atsRegistry.data.ts` with factory configuration data
- Comprehensive test coverage for factory deployment and configuration validation
- Enhanced test fixtures and diamond cut manager integration tests
