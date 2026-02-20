// SPDX-License-Identifier: Apache-2.0

/**
 * Naming utilities for contract naming conventions.
 *
 * TimeTravel variant resolution has been removed — all facets now use LibTimeTravel
 * directly via well-known storage slots, eliminating the need for separate
 * TimeTravel variant contracts. The only special contract is TimeTravelFacet itself,
 * which writes to the override slots.
 *
 * @module core/utils/naming
 */

/**
 * Check if a contract name corresponds to the TimeTravelFacet.
 *
 * Used by deployment workflows to conditionally include TimeTravelFacet
 * (only in test/Hardhat deployments).
 *
 * @param contractName - Contract name to check
 * @returns true if contract is "TimeTravelFacet", false otherwise
 */
export function isTimeTravelFacet(contractName: string): boolean {
  return contractName === "TimeTravelFacet";
}
