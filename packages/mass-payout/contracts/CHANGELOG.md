# @hashgraph/mass-payout-contracts

## 1.1.0

### Minor Changes

- 8d98313: Migrate mass-payout packages from ethers v5 to ethers v6:
  - Update contracts tests and scripts to ethers v6 API (getAddress, waitForDeployment, parseUnits)
  - Migrate SDK to ethers v6 with updated provider/signer patterns and BigInt usage
  - Update hardhat-chai-matchers to v2 with stricter array assertion matching

## 1.0.1

### Patch Changes

- 8ffc87f: Fixed all linting issues and applied code formatting across the codebase. Updated license headers in all source files to use standardized SPDX format (`// SPDX-License-Identifier: Apache-2.0`). Added automated license header validation script (`check-license.js`) that runs during pre-commit to ensure all `.sol`, `.ts`, and `.tsx` files include the required SPDX license identifier.
