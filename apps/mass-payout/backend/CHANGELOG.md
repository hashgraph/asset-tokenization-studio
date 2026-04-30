# @hashgraph/mass-payout-backend

## 1.1.2

### Patch Changes

- a166566: Migrated all voting operations in the SDK from `Equity__factory` to the new `VotingFacet__factory`, aligning with the contract refactor that split voting logic into a dedicated `VotingFacet`. Updated mass-payout contracts to import `IVoting` for voting structs/methods and `ICoupon` for coupon holders, and updated the backend adapter and tests to use `CouponToken` instead of `BondToken` for `getAllCoupons` and `getTotalCouponHolders`.
- Updated dependencies [4431f2e]
- Updated dependencies [add9335]
- Updated dependencies [2b68e6c]
- Updated dependencies [ca1807d]
- Updated dependencies [a166566]
  - @hashgraph/asset-tokenization-sdk@7.0.0
  - @hashgraph/mass-payout-sdk@1.1.2

## 1.1.1

### Patch Changes

- b8c865c: Fix npm vulnerabilities and downstream compatibility issues:
  - Update npm dependencies to address security vulnerabilities across mass-payout packages
  - Fix mass-payout contract imports to use updated `facets/` folder structure from `@hashgraph/asset-tokenization-contracts`
  - Fix ethers v6 API compatibility in backend: update imports from `ethers/lib/utils` to `ethers`, replace deprecated `eventFragment.inputs` with `fragment.inputs`, and replace `constants.AddressZero` with `ZeroAddress`
  - Fix `FileCreateTransaction` in SDK to use account's public key instead of empty keys

- Updated dependencies [77aa333]
- Updated dependencies [2e5fdcf]
- Updated dependencies [b8c865c]
- Updated dependencies [5e58601]
- Updated dependencies [77aa333]
- Updated dependencies [77aa333]
- Updated dependencies [3048bbf]
  - @hashgraph/asset-tokenization-sdk@6.0.0
  - @hashgraph/mass-payout-sdk@1.1.1

## 1.1.0

### Patch Changes

- Updated dependencies [5ba3560]
- Updated dependencies [8d98313]
  - @hashgraph/asset-tokenization-sdk@4.3.0
  - @hashgraph/mass-payout-sdk@1.1.0

## 1.0.1

### Patch Changes

- 8ffc87f: Fixed all linting issues and applied code formatting across the codebase. Updated license headers in all source files to use standardized SPDX format (`// SPDX-License-Identifier: Apache-2.0`). Added automated license header validation script (`check-license.js`) that runs during pre-commit to ensure all `.sol`, `.ts`, and `.tsx` files include the required SPDX license identifier.
- Updated dependencies [8ffc87f]
  - @hashgraph/mass-payout-sdk@1.0.1
  - @hashgraph/asset-tokenization-sdk@4.1.0
