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
 * V4 DESIGN (EVM Accessor Generator): No facet variants.
 * All facets use compile-time accessor generation that produces identical
 * bytecode for prod and test modes — no TimeTravel variant contracts exist.
 *
 * @param contractName - Base contract name (ignored; always false)
 * @returns false — no facet has a TimeTravel variant under v4 design
 *
 * @example
 * ```typescript
 * hasTimeTravelVariant('AccessControlFacet') // false - v4: no variants
 * hasTimeTravelVariant('ProxyAdmin') // false - no variants
 * hasTimeTravelVariant('EvmAccessorsFacet') // false - no variants
 * ```
 *
 * @deprecated v4 eliminates the TimeTravel variant pattern entirely.
 * Kept for API compatibility; always returns false.
 */
export function hasTimeTravelVariant(_contractName: string): boolean {
  return false;
}

/**
 * Resolve contract name based on deployment options.
 *
 * V4 DESIGN: Always returns the base contract name.
 * No TimeTravel variants exist under the EVM Accessor Generator pattern.
 * The `useTimeTravel` flag is ignored for API compatibility.
 *
 * @param contractName - Base contract name
 * @param useTimeTravel - Ignored; kept for API compatibility (v4: no variants)
 * @returns Base contract name (always)
 *
 * @example
 * ```typescript
 * // All calls return the same base name
 * resolveContractName('AccessControlFacet', true)
 * // Returns: 'AccessControlFacet'
 *
 * resolveContractName('AccessControlFacet', false)
 * // Returns: 'AccessControlFacet'
 * ```
 *
 * @deprecated v4 eliminates variants; useTimeTravel flag has no effect.
 */
export function resolveContractName(contractName: string, _useTimeTravel: boolean = false): string {
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
