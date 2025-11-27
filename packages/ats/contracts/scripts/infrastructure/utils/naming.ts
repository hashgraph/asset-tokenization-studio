// SPDX-License-Identifier: Apache-2.0

/**
 * Naming utilities for contract variants and naming conventions.
 *
 * This module provides utilities for working with contract name variants,
 * particularly TimeTravel test variants.
 *
 * @module core/utils/naming
 */

/**
 * Get the TimeTravel variant name for a contract.
 *
 * TimeTravel variants are test versions of contracts that include
 * time manipulation capabilities for testing time-dependent logic.
 *
 * @param contractName - Base contract name (e.g., 'AccessControlFacet')
 * @returns TimeTravel variant name (e.g., 'AccessControlFacetTimeTravel')
 *
 * @example
 * ```typescript
 * const testVariant = getTimeTravelVariant('AccessControlFacet')
 * // Returns: 'AccessControlFacetTimeTravel'
 * ```
 */
export function getTimeTravelVariant(contractName: string): string {
  return `${contractName}TimeTravel`;
}

/**
 * Check if a contract has a TimeTravel variant available.
 *
 * CONVENTION-BASED: Uses naming convention to determine if a contract
 * has a TimeTravel variant. Contracts ending with 'Facet' are assumed
 * to have TimeTravel variants, while infrastructure contracts don't.
 *
 * Invariant: 'TimeTravelFacet' never has a TimeTravel variant.
 *
 * @param contractName - Base contract name
 * @returns true if contract name ends with 'Facet' (except 'TimeTravelFacet'), false otherwise
 *
 * @example
 * ```typescript
 * hasTimeTravelVariant('AccessControlFacet') // true - ends with 'Facet'
 * hasTimeTravelVariant('ProxyAdmin') // false - infrastructure
 * hasTimeTravelVariant('TimeTravelFacet') // false - invariant
 * hasTimeTravelVariant('BusinessLogicResolver') // false - doesn't end with 'Facet'
 * ```
 */
export function hasTimeTravelVariant(contractName: string): boolean {
  // Invariant: 'TimeTravelFacet' never has a TimeTravel variant
  if (contractName === "TimeTravelFacet") {
    return false;
  }

  // Convention: Contracts ending with 'Facet' have TimeTravel variants
  // Infrastructure contracts (ProxyAdmin, TransparentUpgradeableProxy, etc.)
  // don't follow this naming pattern
  return contractName.endsWith("Facet");
}

/**
 * Resolve contract name based on deployment options.
 *
 * Returns the appropriate contract name variant (standard or TimeTravel)
 * based on whether TimeTravel mode is enabled and the contract supports it.
 *
 * @param contractName - Base contract name
 * @param useTimeTravel - Whether to use TimeTravel variant
 * @returns Resolved contract name (TimeTravel variant if applicable, otherwise base name)
 *
 * @example
 * ```typescript
 * // Testing mode
 * const name = resolveContractName('AccessControlFacet', true)
 * // Returns: 'AccessControlFacetTimeTravel'
 *
 * // Production mode
 * const name = resolveContractName('AccessControlFacet', false)
 * // Returns: 'AccessControlFacet'
 *
 * // Contract without TimeTravel support
 * const name = resolveContractName('ProxyAdmin', true)
 * // Returns: 'ProxyAdmin' (no TimeTravel variant exists)
 * ```
 */
export function resolveContractName(contractName: string, useTimeTravel: boolean = false): string {
  if (!useTimeTravel) {
    return contractName;
  }

  if (hasTimeTravelVariant(contractName)) {
    return getTimeTravelVariant(contractName);
  }

  return contractName;
}

/**
 * Extract base contract name from a TimeTravel variant name.
 *
 * @param contractName - Contract name (potentially TimeTravel variant)
 * @returns Base contract name without 'TimeTravel' suffix
 *
 * @example
 * ```typescript
 * const baseName = getBaseContractName('AccessControlFacetTimeTravel')
 * // Returns: 'AccessControlFacet'
 *
 * const baseName = getBaseContractName('AccessControlFacet')
 * // Returns: 'AccessControlFacet' (unchanged)
 * ```
 */
export function getBaseContractName(contractName: string): string {
  const suffix = "TimeTravel";
  if (contractName.endsWith(suffix)) {
    return contractName.slice(0, -suffix.length);
  }
  return contractName;
}

/**
 * Check if a contract name is a TimeTravel variant.
 *
 * @param contractName - Contract name to check
 * @returns true if name ends with 'TimeTravel', false otherwise
 *
 * @example
 * ```typescript
 * isTimeTravelVariant('AccessControlFacetTimeTravel') // true
 * isTimeTravelVariant('AccessControlFacet') // false
 * ```
 */
export function isTimeTravelVariant(contractName: string): boolean {
  return contractName.endsWith("TimeTravel");
}
