# @hashgraph/asset-tokenization-contracts

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
