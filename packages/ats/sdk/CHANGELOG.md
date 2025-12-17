# @hashgraph/asset-tokenization-sdk

## 3.0.0

### Major Changes

- e0a3f03: [ATS-SDK] Add tokenBalance and decimals to getCouponFor and [ATS-WEB] add fullRedeem in forceRedeem view and balance in seeCoupons and seeDividend views

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

- e0a3f03: Add a checkbox in force redeem view to redeem every tokens if the maturity date has arrived
- Updated dependencies [e0a3f03]
- Updated dependencies [e0a3f03]
- Updated dependencies [e0a3f03]
  - @hashgraph/asset-tokenization-contracts@3.0.0

## 2.0.0

### Major Changes

- c62eb6e: **BREAKING:** Nominal value decimals support

  SDK now requires and returns nominal value decimals when working with Bonds and Equities. Update all integration code to handle the new decimal field for consistent value representation.

### Minor Changes

- c62eb6e: Full redeem at maturity functionality added to bond lifecycle operations

- c62eb6e: Dividend Amount For calculation methods added for equity dividend management

- c62eb6e: Coupon Amount For and Principal For calculation methods added for bond payment management

### Patch Changes

- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
  - @hashgraph/asset-tokenization-contracts@2.0.0

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

- Updated dependencies
  - @hashgraph/asset-tokenization-contracts@1.17.0
- Replace proceedRecipientIds for proceedRecipientsIds
