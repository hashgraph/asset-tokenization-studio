# @hashgraph/asset-tokenization-contracts

## 4.3.0

### Minor Changes

- 5de99bd: Move SecurityFacet to layer_2

## 4.2.0

### Minor Changes

- c5b2a50: Add support for multiple bond types (Variable Rate, Fixed Rate, KPI Linked, SPT)

  This release introduces comprehensive support for multiple bond asset types across the Asset Tokenization Studio:

  **Breaking Changes:**
  - Refactored Solidity contracts to check for Equity type instead of Bond type, as Bond is no longer a single type but a family of types (Variable Rate, Fixed Rate, KPI Linked Rate, SPT Rate)
  - Updated asset type filtering logic to use enum values (BOND_VARIABLE_RATE, BOND_FIXED_RATE, BOND_KPI_LINKED_RATE, BOND_SPT_RATE, EQUITY) instead of display strings

  **Contract Changes:**
  - Updated LifeCycleCashFlowStorageWrapper.sol to invert AssetType checks: now validates if asset is Equity (special case) with bond types as the default behavior
  - Added comprehensive test coverage for all bond types in lifecycle cash flow tests

  **SDK Changes:**
  - Extended asset type system to support four distinct bond types plus equity
  - Maintained backward compatibility for existing integrations

  This is a **minor** version bump as it adds new functionality (multiple bond types) while maintaining backward compatibility through the enum-based approach.

- a942765: Migrate totalSupply and balances to ERC20 storage with lazy migration strategy

  This PR introduces a storage migration that moves `totalSupply` and `balances` from the legacy ERC1410BasicStorage to the new ERC20Storage, enabling better separation of concerns and improved gas efficiency.

  **Key Changes:**
  - **New Storage Structure**: Added `totalSupply` and `balances` fields to ERC20Storage struct in ERC20StorageWrapper1
  - **Lazy Migration**: Implemented `_migrateTotalSupplyIfNeeded()` and `_migrateBalanceIfNeeded()` functions that automatically migrate values from deprecated storage on first access
  - **Migration Triggers**: `_adjustTotalSupply` and `_adjustTotalBalanceFor` call `_migrateTotalSupplyIfNeeded` and `_migrateBalanceIfNeeded` respectively, ensuring migration is triggered during balance adjustment operations
  - **Backward Compatibility**: View functions prioritize legacy storage values, falling back to new storage when legacy is empty
  - **Deprecated Fields**: Renamed `_totalSupply_` to `DEPRECATED_totalSupply` and `_balances_` to `DEPRECATED_balances` in ERC1410BasicStorage to indicate deprecation
  - **Event Emission**: Simplified Transfer event emission by replacing internal `_emitTransferEvent` wrapper with direct `emit Transfer` statements
  - **New Helper Methods**: Added `_increaseBalance`, `_reduceBalance`, `_increaseTotalSupply`, `_reduceTotalSupply`, and `_adjustTotalBalanceFor` functions
  - **Migration Test Contract**: Added MigrationFacetTest for testing the migration scenarios
  - **Integration Tests**: Added `adjustBalances` integration tests verifying that `adjustBalances` migrates `totalSupply` eagerly and that per-account balance migration is triggered lazily on the next token interaction

  **Benefits:**
  - Cleaner storage architecture with ERC20-specific data in ERC20Storage
  - Automatic, transparent migration with no disruption to existing tokens
  - Small gas savings from simplified event emission (~50-70 gas per transfer operation)

- 2a26b41: Migrate from ether 5 to ether 6

### Patch Changes

- 35fde1c: Improve test infrastructure and coverage for contracts scripts:
  - Reorganize test suite into unit/integration categories
  - Add comprehensive unit tests for registry generator, checkpoint manager, and deployment utilities
  - Refactor registry generator into modular architecture (cache/, core/, utils/)
  - Standardize CLI utilities and improve error handling
  - Fix changeset-check workflow to use dynamic base branch instead of hardcoded develop

- 33e8046: Enhance checkpoint system with step tracking, retry utilities, and CLI management
  - Centralize deployment/checkpoint path management and step definitions
  - Add retry utility with exponential backoff for transient network failures
  - Implement checkpoint schema versioning with migration support
  - Add checkpoint management CLI (list/show/delete/cleanup/reset)
  - Add failure injection testing module for reproducible recovery testing
  - Comprehensive test coverage and documentation for checkpoint system

- 04e7366: Add CI deployment testing workflow and harden CI pipeline
  - Add GitHub Actions workflow for automated deployment testing (Hardhat + Hiero Solo)
  - Extract shared build job with dependency/artifact caching to eliminate duplication
  - Migrate deployment workflow to Hiero Solo with standardized naming convention
  - Upgrade actions/checkout v4.2.2 → v5.0.0 across all workflows
  - Pin actions/cache to v4.2.3 with SHA, add timeout-minutes and concurrency controls
  - Add defaults.run.shell: bash and codecov version annotation
  - Fix facet registration: replace 195 parallel RPC calls with synchronous registry lookups
  - Wrap signer with NonceManager to prevent nonce caching issues during deployment
  - Fix ethers v6 API in diamondCutManager test (keccak256, contract address accessor)
  - Add selector conflict validation test (SelectorAlreadyRegistered error)
  - Add timing output and type-safe error handling to registry generation task

- c81bab9: Cleanup and standardize GitHub Actions workflows:
  - Adopt Hiero naming convention: `ddd-xxxx-<name>.yaml` with `ddd: [XXXX] <Name>` workflow names
  - Standardize bash syntax: `[[ ]]` double brackets, `==` comparisons, `${VAR}` braces
  - Fix `$GITHUB_OUTPUT` quoting inconsistencies in publish workflows
  - Fix `if: always()` to `if: ${{ always() }}` expression syntax
  - Remove unnecessary PR formatting triggers that wasted CI runner minutes
  - Fix assignee check for security (expression injection prevention)
  - Delete obsolete backup workflow files (fully commented-out dead code)
  - Update cross-references in README.md, ci-cd-workflows.md, and CLAUDE.md

- e378e82: - Rename test/contracts/unit to test/contracts/integration to accurately reflect test type
  - Add Mocha rootHooks and globalSetup.ts to silence script logger globally during tests
  - Fix logging.test.ts and hedera.test.ts to prevent logger state leakage between suites
- ad45d49: Fix checkpoint ID format documentation and update step counts in JSDoc comments
- fe7032f: Refactor integration test helpers to reduce boilerplate and eliminate magic numbers:
  - Add centralized test constants (TEST_DELAYS, TEST_OPTIONS.CONFIRMATIONS_INSTANT, EIP1967_SLOTS, TEST_GAS_LIMITS, TEST_INIT_VALUES)
  - Create reusable test helpers (silenceScriptLogging, createCheckpointCleanupHooks)
  - Standardize import organization across all integration tests
  - Reclassify atsRegistry.data.test.ts from integration to unit directory
  - Reduce test code duplication (~100 lines eliminated)

## 4.1.1

### Patch Changes

- Fix ATS Publish github action because Package ATS Contracts job has an out of memory error and translate to English some Spanish text in compile.ts and selector.ts

## 4.1.0

### Minor Changes

- 60f35fc: kpi linked interest rate coupons now use the kpi latest facet instead of the kpi oracle

### Patch Changes

- 5f579dc: Fix all lint issues in contracts package.
- f1bac7a: Add three-layer DCO and GPG signature enforcement via git hooks (commit-msg, pre-push) and developer onboarding script.
- 8ffc87f: Fixed all linting issues and applied code formatting across the codebase. Updated license headers in all source files to use standardized SPDX format (`// SPDX-License-Identifier: Apache-2.0`). Added automated license header validation script (`check-license.js`) that runs during pre-commit to ensure all `.sol`, `.ts`, and `.tsx` files include the required SPDX license identifier.
- bde618b: Refactor registry generator into modular architecture and migrate CLI scripts from ts-node to tsx for faster execution (~3x improvement in startup time).

## 4.0.1

### Patch Changes

- 171b22b: Fix all lint issues in contracts package.
- d1552c7: refactor(scripts): standardize CLI entry points and improve infrastructure

  **CLI Standardization:**
  - Unified CLI entry points to match workflow names (deploySystemWithNewBlr, deploySystemWithExistingBlr, upgradeConfigurations, upgradeTupProxies)
  - Created shared validation utilities in `cli/shared/` module eliminating ~100+ lines of duplicated code
  - Standardized environment variable parsing and address validation across all CLI files

  **Infrastructure Improvements:**
  - Resolved circular import issues in logging module
  - Exposed tools layer API through main scripts entry point
  - Consolidated validation utilities for better code reuse

  **Performance Fix:**
  - Fixed parallel test performance regression (8+ min → 2 min)
  - Restored dynamic imports in blrConfigurations.ts to prevent eager typechain loading
  - Added troubleshooting documentation for future reference

  **Documentation:**
  - Enhanced JSDoc documentation across infrastructure operations
  - Added troubleshooting section for parallel test performance issues
  - Updated README with CLI shared utilities documentation

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
