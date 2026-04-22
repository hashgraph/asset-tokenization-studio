# @hashgraph/mass-payout-contracts

## 1.1.2

### Patch Changes

- 841a069: Migrated all voting operations in the SDK from `Equity__factory` to the new `VotingFacet__factory`, aligning with the contract refactor that split voting logic into a dedicated `VotingFacet`. Updated mass-payout contracts to import `IVoting` for voting structs/methods and `ICoupon` for coupon holders, and updated the backend adapter and tests to use `CouponToken` instead of `BondToken` for `getAllCoupons` and `getTotalCouponHolders`.

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
