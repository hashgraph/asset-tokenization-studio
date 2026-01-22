# @hashgraph/asset-tokenization-contracts

## 4.0.0

### Major Changes

- 3ba32c9: Audit issues fixes: compliance with ERC1400 standard, pause bypasses removed, dividends calculations errors fixed, hold data stale data updated, duplicated CA not accepted anymore, batch freeze operations and external lists do not accept zero addresses anymore, gas optimizations
- 6950d41: Code refactor plus Coupon fixing, start and end date added. Four type of bonds exist : standard, fixed rate, kpi linked rate and sustainability performance target rate
- 8f7487a: EIP712 standard fixed. Now single name (ERC20 token name) and version (BLR version number) used for all facets methods. Nonce facet created to centralized to nonce per user management.

### Minor Changes

- 2d5495e: Increase test coverage for smart contracts by adding comprehensive tests for ERC standards (ERC1410, ERC20, ERC3643, ERC20Permit, ERC20Votes), factory components, bond and equity modules, clearing, access control, external lists, KPIs, and other functionalities. Includes fixes for test synchronization, removal of unused code, and optimization of test fixtures.
- 902fea1: Added Docusaurus and project documentation, renamed the MP package organization, and added a Claude documentation command.
- 1f51771: Centralize deployment file management and enhance for downstream consumption:

  **Bug Fixes & Refactoring:**
  - Fixed critical variable shadowing bug in filename extraction
  - Added cross-platform path handling (Unix/Windows)
  - Eliminated 240 lines of duplicated code across workflow files
  - Centralized deployment file utilities in infrastructure layer
  - Added TDD regression tests to prevent future bugs

  **New Features (Downstream Enhancement):**
  - Made `WorkflowType` fully extensible: changed from `AtsWorkflowType | (string & Record<string, never>)` to `AtsWorkflowType | string`
  - Made deployment output types fully extensible by removing generic constraint
  - Added type guards: `isSaveSuccess()`, `isSaveFailure()`, `isAtsWorkflow()`
  - Added `registerWorkflowDescriptor()` for custom workflow naming
  - Updated `generateDeploymentFilename()` with descriptor registry fallback
  - Added comprehensive downstream usage documentation to README
  - Exported `ATS_WORKFLOW_DESCRIPTORS` and new utility functions

  **Breaking Changes:**
  - `WorkflowType`: Simplified from complex intersection to clean union `AtsWorkflowType | string`
  - `SaveDeploymentOptions<T>` and `saveDeploymentOutput<T>()` now accept any type (removed `extends AnyDeploymentOutput` constraint)
  - These changes enable downstream projects to use custom workflows and output types without type assertions
  - ATS workflows maintain full type safety through literal types and default type parameters

  Enables downstream projects (like GBP) to extend ATS deployment utilities with custom workflows and output types while maintaining type safety and backward compatibility.

- b802e88: feat(contracts): add updateResolverProxyConfig operation with comprehensive tests

  Add new `updateResolverProxyConfig` operation for updating already deployed ResolverProxy configurations. Enables downstream projects to update proxy version, configuration ID, or resolver address without redeploying.

  Features:
  - Parameter-based action detection (version/config/resolver updates)
  - `getResolverProxyConfigInfo` helper for querying proxy state
  - Pre/post state verification with structured results
  - New lightweight `deployResolverProxyFixture` using composition pattern
  - 33 comprehensive tests (12 unit + 21 integration)
  - Architecture documentation in CLAUDE.md

- c7ff16f: Add comprehensive upgrade workflows for ATS configurations and infrastructure

  **New Features:**
  - Configuration upgrade workflow for ResolverProxy token contracts (Equity/Bond)
  - TUP proxy upgrade workflow for BLR and Factory infrastructure
  - CLI entry points for both upgrade patterns with environment configuration
  - Checkpoint-based resumability for failed upgrades
  - Selective configuration upgrades (equity, bond, or both)
  - Batch update support for multiple ResolverProxy tokens

  **Infrastructure Improvements:**
  - Fixed import inconsistencies (relative imports → @scripts/\* aliases)
  - Simplified checkpoint directory structure (.checkpoints/)
  - Added Zod runtime validation with helpful error messages
  - Optimized registry lookups from O(n²) to O(n) complexity
  - Enhanced CheckpointManager with nested path support
  - Added ts-node configuration for path alias resolution
  - Fixed confirmations bug in tests

  **Testing:**
  - 1,419 new test cases with comprehensive coverage
  - 33 configuration upgrade tests
  - 25 TUP upgrade tests
  - Enhanced checkpoint resumability tests
  - All 1,010 tests passing

  **Documentation:**
  - Added Scenarios 3-6 to DEVELOPER_GUIDE.md
  - Comprehensive README.md upgrade sections
  - Updated .env.sample with upgrade variables
  - Clear distinction between TUP and ResolverProxy patterns

  **Breaking Changes:** None - backward compatible

- cbcc1db: Protected Transfer and Lock methods removed from smart contracts and sdk.

### Patch Changes

- dff883d: Fix CI/CD workflow bug where Contracts package was never published to npm due to duplicate SDK publish block. The second publish step now correctly publishes Contracts instead of publishing SDK twice.
- 7f92cd7: Enable parallel test execution with tsx loader for 60-75% faster test runs
  - Add tsx (v4.21.0) for runtime TypeScript support in Mocha worker threads
  - Configure parallel test scripts with NODE_OPTIONS='--import tsx'
  - Fix circular dependency in checkpoint module imports
  - Fix DiamondCutManager test assertions to use TypeChain factories
  - Separate contract and script tests with dedicated parallel targets

- c10a8ee: Replaced the Hashgraph SDK with the Hiero Ledger SDK
- 1ecd8ee: Update timestamp format to ISO standard with filesystem-safe characters
- fa07c70: test(contracts): add comprehensive unit and integration tests for TUP upgrade operations

  Add 34 tests for TransparentUpgradeableProxy (TUP) upgrade operations:
  - 13 unit tests covering parameter validation, behavior detection, result structure, and helper functions
  - 21 integration tests covering upgrade scenarios, access control, state verification, and gas reporting
  - New TUP test fixtures using composition pattern (deployTupProxyFixture, deployTupProxyWithV2Fixture)
  - Mock contracts (MockImplementation, MockImplementationV2) with proper initialization guards and storage layout compatibility

## 3.1.0

### Minor Changes

- 1f51771: Centralize deployment file management and enhance for downstream consumption:

  **Bug Fixes & Refactoring:**
  - Fixed critical variable shadowing bug in filename extraction
  - Added cross-platform path handling (Unix/Windows)
  - Eliminated 240 lines of duplicated code across workflow files
  - Centralized deployment file utilities in infrastructure layer
  - Added TDD regression tests to prevent future bugs

  **New Features (Downstream Enhancement):**
  - Made `WorkflowType` fully extensible: changed from `AtsWorkflowType | (string & Record<string, never>)` to `AtsWorkflowType | string`
  - Made deployment output types fully extensible by removing generic constraint
  - Added type guards: `isSaveSuccess()`, `isSaveFailure()`, `isAtsWorkflow()`
  - Added `registerWorkflowDescriptor()` for custom workflow naming
  - Updated `generateDeploymentFilename()` with descriptor registry fallback
  - Added comprehensive downstream usage documentation to README
  - Exported `ATS_WORKFLOW_DESCRIPTORS` and new utility functions

  **Breaking Changes:**
  - `WorkflowType`: Simplified from complex intersection to clean union `AtsWorkflowType | string`
  - `SaveDeploymentOptions<T>` and `saveDeploymentOutput<T>()` now accept any type (removed `extends AnyDeploymentOutput` constraint)
  - These changes enable downstream projects to use custom workflows and output types without type assertions
  - ATS workflows maintain full type safety through literal types and default type parameters

  Enables downstream projects (like GBP) to extend ATS deployment utilities with custom workflows and output types while maintaining type safety and backward compatibility.

- b802e88: feat(contracts): add updateResolverProxyConfig operation with comprehensive tests

  Add new `updateResolverProxyConfig` operation for updating already deployed ResolverProxy configurations. Enables downstream projects to update proxy version, configuration ID, or resolver address without redeploying.

  Features:
  - Parameter-based action detection (version/config/resolver updates)
  - `getResolverProxyConfigInfo` helper for querying proxy state
  - Pre/post state verification with structured results
  - New lightweight `deployResolverProxyFixture` using composition pattern
  - 33 comprehensive tests (12 unit + 21 integration)
  - Architecture documentation in CLAUDE.md

- c7ff16f: Add comprehensive upgrade workflows for ATS configurations and infrastructure

  **New Features:**
  - Configuration upgrade workflow for ResolverProxy token contracts (Equity/Bond)
  - TUP proxy upgrade workflow for BLR and Factory infrastructure
  - CLI entry points for both upgrade patterns with environment configuration
  - Checkpoint-based resumability for failed upgrades
  - Selective configuration upgrades (equity, bond, or both)
  - Batch update support for multiple ResolverProxy tokens

  **Infrastructure Improvements:**
  - Fixed import inconsistencies (relative imports → @scripts/\* aliases)
  - Simplified checkpoint directory structure (.checkpoints/)
  - Added Zod runtime validation with helpful error messages
  - Optimized registry lookups from O(n²) to O(n) complexity
  - Enhanced CheckpointManager with nested path support
  - Added ts-node configuration for path alias resolution
  - Fixed confirmations bug in tests

  **Testing:**
  - 1,419 new test cases with comprehensive coverage
  - 33 configuration upgrade tests
  - 25 TUP upgrade tests
  - Enhanced checkpoint resumability tests
  - All 1,010 tests passing

  **Documentation:**
  - Added Scenarios 3-6 to DEVELOPER_GUIDE.md
  - Comprehensive README.md upgrade sections
  - Updated .env.sample with upgrade variables
  - Clear distinction between TUP and ResolverProxy patterns

  **Breaking Changes:** None - backward compatible

### Patch Changes

- 7f92cd7: Enable parallel test execution with tsx loader for 60-75% faster test runs
  - Add tsx (v4.21.0) for runtime TypeScript support in Mocha worker threads
  - Configure parallel test scripts with NODE_OPTIONS='--import tsx'
  - Fix circular dependency in checkpoint module imports
  - Fix DiamondCutManager test assertions to use TypeChain factories
  - Separate contract and script tests with dedicated parallel targets

- 1ecd8ee: Update timestamp format to ISO standard with filesystem-safe characters
- fa07c70: test(contracts): add comprehensive unit and integration tests for TUP upgrade operations

  Add 34 tests for TransparentUpgradeableProxy (TUP) upgrade operations:
  - 13 unit tests covering parameter validation, behavior detection, result structure, and helper functions
  - 21 integration tests covering upgrade scenarios, access control, state verification, and gas reporting
  - New TUP test fixtures using composition pattern (deployTupProxyFixture, deployTupProxyWithV2Fixture)
  - Mock contracts (MockImplementation, MockImplementationV2) with proper initialization guards and storage layout compatibility

## 3.0.0

### Minor Changes

- e0a3f03: Add bytes operationData to ClearingOperationApproved event in case of creating a new hold to send the holdId or to be used by other operation in the future

### Patch Changes

- e0a3f03: fix: CI workflow improvements for reliable releases
  1. **Fixed --ignore pattern in ats.release.yml**: Changed from non-existent
     `@hashgraph/mass-payout*` to correct `@mass-payout/*` package namespace
  2. **Simplified publish trigger in ats.publish.yml**: Changed from
     `release: published` to `push.tags` for automatic publishing on tag push
     (no need to manually create GitHub release)
  3. **Removed recursive publish scripts**: Removed `"publish": "npm publish"`
     from contracts and SDK package.json files that caused npm to recursively
     call itself during publish lifecycle, resulting in 403 errors in CI

- e0a3f03: Lock and Clearing operations now trigger account balance snapshots. Frozen balance at snapshots methods created

## 2.0.0

### Major Changes

- c62eb6e: **BREAKING:** Nominal value decimals added to Bonds and Equities

  Nominal value decimals must now be provided when deploying new Bonds/Equities and must be retrieved when reading the nominal value. This change ensures consistent decimal handling across the platform.

### Minor Changes

- c62eb6e: Refactor deployment scripts into modular infrastructure/domain architecture with framework-agnostic provider pattern and automated registry generation

  **Breaking Changes:**
  - Deployment scripts API changed: operations now require `DeploymentProvider` parameter
  - Import paths changed to `@scripts/infrastructure` and `@scripts/domain` aliases
  - Removed legacy command/query/result patterns and monolithic scripts
  - Scripts reorganized: infrastructure/ (generic, reusable) and domain/ (ATS-specific)

  **Architecture:**
  - Infrastructure/Domain Separation with DeploymentProvider interface
  - Provider implementations for Hardhat and Standalone Node.js
  - Modular operations and workflow compositions

  **Registry System Enhancements:**
  - Automated generation with event/error deduplication
  - Expanded metadata: 49 facets, 2 infrastructure contracts, 29 storage wrappers, 28 unique roles
  - Zero warnings with TimeTravelFacet correctly excluded

  **Performance:**
  - Full build: 43.5s → 45.3s (+1.8s, 4% overhead)
  - Net code reduction: 2,947 lines across 175 files

- c62eb6e: Export missing utilities and enhance deployment tracking

  Exported utilities: Hedera integration, deployment file management, verification, selector generation, transparent proxy deployment, and bond token deployment from factory. Enhanced deployment workflows with better tracking for BLR implementation and explicit contract IDs.

- c62eb6e: Full redeem at maturity method added to bond lifecycle management

- c62eb6e: Bond and Equity storage layout updated to avoid breaking changes and maintain consistency with previous versions

- c62eb6e: Dividend Amount For methods added for equity dividend calculations

- c62eb6e: Coupon Amount For and Principal For methods added for bond payment calculations

### Patch Changes

- c62eb6e: Optimize test fixture deployment speed (96% improvement). Improved contract test performance from 47 seconds to 2 seconds per fixture by fixing inefficient batch processing and removing unnecessary network delays

- c62eb6e: Fix clean imports from /scripts path with Hardhat compatibility. Added `typesVersions` field for legacy TypeScript compatibility and missing runtime dependencies (`tslib` and `dotenv`)

- c62eb6e: Update DEVELOPER_GUIDE.md with current architecture and comprehensive script documentation

- c62eb6e: Fix base implementation in TotalBalanceStorageWrapper

## 1.17.1

### Patch Changes

- Update publishing workflows to enable non production with provenance publishing

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
