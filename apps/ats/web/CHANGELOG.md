# @hashgraph/asset-tokenization-dapp

## 3.0.0

### Minor Changes

- e0a3f03: Add getCouponAmountFor info (numerator, denominator, recordDateReached) to see coupon view
- e0a3f03: [ATS-SDK] Add tokenBalance and decimals to getCouponFor and [ATS-WEB] add fullRedeem in forceRedeem view and balance in seeCoupons and seeDividend views
- e0a3f03: Add a checkbox in force redeem view to redeem every tokens if the maturity date has arrived
- e0a3f03: Add getDividendAmountFor info (numerator, denominator, recordDateReached) in see dividend view

### Patch Changes

- Updated dependencies [e0a3f03]
- Updated dependencies [e0a3f03]
- Updated dependencies [e0a3f03]
  - @hashgraph/asset-tokenization-sdk@3.0.0

## 2.0.0

### Major Changes

- c62eb6e: **BREAKING:** Nominal value decimals integration

  Web application now displays and requires nominal value decimals for all Bond and Equity operations. UI components updated to handle decimal precision consistently across all asset views.

### Minor Changes

- c62eb6e: Dividend Amount For display added to see dividend view with calculation details (numerator, denominator, recordDateReached)

- c62eb6e: Coupon Amount For and Principal For display added to bond views with full calculation breakdown

### Patch Changes

- c62eb6e: Add decimal precision display to nominal value in bonds and equity views

- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
  - @hashgraph/asset-tokenization-sdk@2.0.0

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

- Display proceed recipients' data in text format in ats web
- Updated dependencies
  - @hashgraph/asset-tokenization-sdk@1.17.0
