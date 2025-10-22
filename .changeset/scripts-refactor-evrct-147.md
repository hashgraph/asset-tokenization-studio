---
'@hashgraph/asset-tokenization-contracts': minor
---

Refactor deployment scripts into modular infrastructure/domain architecture with framework-agnostic provider pattern and automated registry generation.

**Breaking Changes:**

- Deployment scripts API changed: operations now require `DeploymentProvider` parameter
- Import paths changed to `@scripts/infrastructure` and `@scripts/domain` aliases
- Removed legacy command/query/result patterns and monolithic scripts
- Scripts reorganized: infrastructure/ (generic, reusable) and domain/ (ATS-specific)
- Some function signatures changed for consistency with provider pattern

**Architecture:**

- **Infrastructure/Domain Separation**: Strict separation between generic operations (infrastructure/) and ATS-specific business logic (domain/)
- **DeploymentProvider Interface**: Framework-agnostic deployment abstraction enabling scripts to work with Hardhat OR standalone Node.js
- **Provider Implementations**: HardhatProvider (uses Hardhat ethers) and StandaloneProvider (pure ethers.js)
- **Modular Operations**: Atomic deployment operations (deployBlr, deployFacets, createBatchConfiguration, deployProxy, upgradeProxy)
- **Workflow Compositions**: High-level orchestration (deployCompleteSystem, deployWithExistingBlr)

**Registry System Enhancements:**

- **Automated Generation**: Registry regenerates automatically after compilation (integrated into Hardhat build)
- **Event/Error Deduplication**: Filters out StorageWrapper base classes during inheritance (AccessControlFacet: 51→4 events, 88% reduction)
- **Expanded Metadata**: 49 facets | 2 infrastructure contracts | 29 storage wrappers | 28 unique roles
- **Rich Metadata**: Full inheritance chains, method signatures with selectors, events with topic0, custom errors
- **Minimal Output Mode**: Uses LogLevel system for quiet compilation output
- **Zero Warnings**: TimeTravelFacet correctly excluded from resolver key and variant checks

**External Facet Extensibility:**

- Enable downstream projects (e.g., Green Bonds Platform) to deploy custom facets alongside ATS facets
- `deployFacets()` and `createBatchConfiguration()` accept facets not in ATS registry
- `RegistryProvider` interface for dependency injection pattern
- Registry generation tools exported for downstream use

**Code Quality:**

- **Deduplication**: 90% code duplication eliminated between equity/bond modules (240 lines removed)
- **Magic Numbers**: Eliminated across 175 test files, replaced with named constants
- **Type Safety**: Fixed 748 TypeScript errors with proper Hardhat plugin type references
- **Test Modernization**: All test fixtures updated to use new modular deployment approach

**Facet Standardization:**

- All facets follow `*Facet.sol` naming convention
- TimeTravel variants follow `*FacetTimeTravel.sol` pattern
- ERC20Votes split into library (ERC20Votes.sol) + facet (ERC20VotesFacet.sol)

**Performance:**

- Full build: 43.5s → 45.3s (+1.8s, 4% overhead for registry)
- Registry generation: ~1.5s standalone
- Net code reduction: 2,947 lines (29,203 insertions, 32,150 deletions across 175 files)
