# @hashgraph/asset-tokenization-contracts

## 2.0.0

### Major Changes

- c748529: nominal value decimals added to Bonds and Equities.
  Now the nominal value decimals must be provided when deploying new Bonds/Equities and must be retrieved when reading the nominal value.

### Minor Changes

- c748529: feat: export missing utilities and enhance deployment tracking

  Export missing infrastructure and domain utilities from scripts index:
  - Export Hedera utilities (`fetchHederaContractId`, `getMirrorNodeUrl`, `isHederaNetwork`) for mirror node integration
  - Export deployment file utilities (`loadDeployment`, `findLatestDeployment`, `listDeploymentFiles`) for deployment management
  - Export verification utilities (`verifyContract`, `verifyContractCode`, `verifyContractInterface`) for post-deployment validation
  - Export selector utility (`getSelector`) for function selector generation
  - Export transparent proxy deployment operation (`deployTransparentProxy`)
  - Export bond token deployment from factory (`deployBondFromFactory`)

  Enhance deployment workflows with better tracking:
  - Add optional `existingBlrImplementation` parameter to track BLR implementation address when using existing BLR
  - Replace ambiguous `contractId` field with explicit `implementationContractId` and `proxyContractId` fields for proxied contracts (BLR, Factory)
  - Improve deployment documentation and upgrade history tracking
  - Better integration with Hedera tooling requiring explicit contract IDs

  These changes improve the public API consistency and provide better deployment documentation for downstream consumers like GBP.

- c748529: full redeem at maturity method added
- c748529: Bond and Equity storage layout updated to avoid breaking change and inconsistency with previous versions
- c748529: Refactor deployment scripts into modular infrastructure/domain architecture with framework-agnostic provider pattern and automated registry generation.

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

- c748529: Dividend Amount For added
- c748529: Coupon Amount For and Principal For methods added

### Patch Changes

- c748529: Update DEVELOPER_GUIDE.md with current architecture and comprehensive script documentation including core operations, modules, and workflow patterns
- c748529: fix: enable clean imports from /scripts path with Hardhat compatibility

  Fixed npm package exports to enable clean imports:
  - Import from `@hashgraph/asset-tokenization-contracts/scripts` instead of `/build/scripts`
  - Added `typesVersions` field for legacy TypeScript `moduleResolution: "node"` compatibility (required by Hardhat)
  - Added missing runtime dependencies: `tslib` and `dotenv`
  - Removed duplicate export entry that caused confusion
  - Added package validation tools: `publint` and `@arethetypeswrong/cli`

  This maintains full compatibility with Hardhat v2 CommonJS requirements while providing proper TypeScript type resolution.

- c748529: fix base implementation in TotalBalanceStorageWrapper
- c748529: - Optimize test fixture deployment speed (96% improvement). Improved contract test performance from 47 seconds to 2 seconds per fixture by fixing inefficient batch processing and removing unnecessary network delays on instant-mining networks (Hardhat/local).
  - Remove duplicated contract interface fragments in test files (ERC3643, clearing, protectedPartitions tests).

## 1.17.0

### Minor Changes

- a36b1c8: Integrate Changesets for version management and implement enterprise-grade release workflow

  #### Changesets Integration
  - Add Changesets configuration with fixed versioning for ATS packages (contracts, SDK, dapp)
  - Configure develop-branch strategy as base for version management
  - Add comprehensive changeset management scripts: create, version, publish, status, snapshot
  - Implement automated semantic versioning and changelog generation
  - Add @changesets/cli dependency for modern monorepo version management

  #### Enterprise Release Workflow
  - Implement new ats.publish.yml workflow focused exclusively on contracts and SDK packages
  - Add manual trigger with dry-run capability for safe testing before actual releases
  - Configure parallel execution of contracts and SDK publishing jobs for improved performance
  - Support automatic triggers on version tags, release branches, and GitHub releases
  - Add changeset validation workflow to enforce one changeset per PR requirement
  - Include bypass labels for non-feature changes (no-changeset, docs-only, hotfix, chore)

  #### Repository Configuration
  - Update .gitignore to properly track .github/ workflows while excluding build artifacts
  - Remove deprecated all.publish.yml workflow in favor of focused ATS publishing
  - Update package.json with complete changeset workflow scripts and release commands
  - Enhance documentation with new version management workflow and enterprise practices

  #### Benefits
  - **Modern Version Management**: Semantic versioning with automated changelog generation
  - **Enterprise Compliance**: Manual release control with proper audit trails
  - **Parallel Publishing**: Improved CI/CD performance with independent job execution
  - **Developer Experience**: Simplified workflow with comprehensive documentation
  - **Quality Assurance**: Mandatory changeset validation ensures all changes are documented

  This establishes a production-ready, enterprise-grade release management system that follows modern monorepo practices while maintaining backward compatibility with existing development workflows.

### Patch Changes

- No autoexecute extract methods script
- Remove duplicate logs in deploy script
