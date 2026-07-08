# @hashgraph/mass-payout-contracts

## 1.1.4

## 1.1.3

### Patch Changes

- ccd68f4: Add PR-gating lint and format CI workflows for ATS and MP, align workflow name prefixes with filenames, pin Node.js version via .nvmrc, and remove obsolete NODE_OPTIONS heap workarounds.
- b99b658: refactor(contracts): centralised facet initialisation, `onlyOperational` gate, and resolver key rename (BBND-1688).
  - `InitializerStorageWrapper` pattern applied to all facets: `onlyRole(DEFAULT_ADMIN_ROLE)` + `onlyFacetNotRegistered(RESOLVER_KEY_XXX)` → `setFacetToReady(RESOLVER_KEY_XXX)` → emit `XxxInitialized()`. Subsequent calls revert with `FacetAlreadyRegistered`.
  - Existing boolean guards migrated: AccessControl, BondUSA (fixed/KPI/variable), Cap, CapByPartition, ControlList, EquityUSA, Security.
  - `initializeXxx` added to ~70 facets that had no prior initialisation guard.
  - Virtual resolver-key pattern (`_bondInitializerKey()`, `_transferAndLockInitializerKey()`, etc.) introduced for abstract base facets shared across multiple concrete types.
  - `onlyOperational` gate added to all state-changing functions; `Factory._deploySecurity()` calls every initialiser before marking the proxy operational via `_SECURITY_FACETS_MAX`.
  - Resolver keys renamed from `_XXX_RESOLVER_KEY` to `RESOLVER_KEY_XXX` and moved from `constants/resolverKeys.sol` to each facet's own interface file.
  - `applyRoles` no longer returns `bool`; `RolesNotApplied` removed; `RolesApplied` gains `appliedRoles` + `appliedStates` parameters.
  - Empty contracts removed: `AmortizationStorageWrapper.sol`, `LoanStorageWrapper.sol`, `NominalValueModifiers.sol`, `ERC20Modifiers.sol`, `ExternalListModifiers.sol`.
  - Mass-payout: `AssetMock` gains `initializeBalanceAdjustments` stub.

  Breaking changes: state-changing functions revert with `AssetNotOperational` until fully initialised. `SecurityModifiers.sol` and `onlyNotSecurityInitialized` removed. `IClearingActions` removed — use `IClearing`/`ClearingFacet`. All `_XXX_RESOLVER_KEY` constants renamed to `RESOLVER_KEY_XXX` and moved to interface files. `applyRoles` return type changed to `void`; `RolesApplied` event gains two new parameters.

- a631037: Add `packages/ats/contracts/**` to MP test workflow trigger paths so ATS contract changes automatically run MP tests and catch interface breakages.
- 841a069: Migrated all voting operations in the SDK from `Equity__factory` to the new `VotingFacet__factory`, aligning with the contract refactor that split voting logic into a dedicated `VotingFacet`. Updated mass-payout contracts to import `IVoting` for voting structs/methods and `ICoupon` for coupon holders, and updated the backend adapter and tests to use `CouponToken` instead of `BondToken` for `getAllCoupons` and `getTotalCouponHolders`.

## 1.1.2

### Patch Changes

- a166566: Migrated all voting operations in the SDK from `Equity__factory` to the new `VotingFacet__factory`, aligning with the contract refactor that split voting logic into a dedicated `VotingFacet`. Updated mass-payout contracts to import `IVoting` for voting structs/methods and `ICoupon` for coupon holders, and updated the backend adapter and tests to use `CouponToken` instead of `BondToken` for `getAllCoupons` and `getTotalCouponHolders`.

## 1.1.1

### Patch Changes

- b8c865c: Fix npm vulnerabilities and downstream compatibility issues:
  - Update npm dependencies to address security vulnerabilities across mass-payout packages
  - Fix mass-payout contract imports to use updated `facets/` folder structure from `@hashgraph/asset-tokenization-contracts`
  - Fix ethers v6 API compatibility in backend: update imports from `ethers/lib/utils` to `ethers`, replace deprecated `eventFragment.inputs` with `fragment.inputs`, and replace `constants.AddressZero` with `ZeroAddress`
  - Fix `FileCreateTransaction` in SDK to use account's public key instead of empty keys

## 1.1.0

### Minor Changes

- 8d98313: Migrate mass-payout packages from ethers v5 to ethers v6:
  - Update contracts tests and scripts to ethers v6 API (getAddress, waitForDeployment, parseUnits)
  - Migrate SDK to ethers v6 with updated provider/signer patterns and BigInt usage
  - Update hardhat-chai-matchers to v2 with stricter array assertion matching

## 1.0.1

### Patch Changes

- 8ffc87f: Fixed all linting issues and applied code formatting across the codebase. Updated license headers in all source files to use standardized SPDX format (`// SPDX-License-Identifier: Apache-2.0`). Added automated license header validation script (`check-license.js`) that runs during pre-commit to ensure all `.sol`, `.ts`, and `.tsx` files include the required SPDX license identifier.
