// SPDX-License-Identifier: Apache-2.0

/**
 * Centralized contract registry for ATS deployment system.
 *
 * This module re-exports the auto-generated registry and provides helper
 * functions for querying contract metadata. The actual registry data is
 * maintained in registry.generated.ts (auto-generated from contracts/).
 *
 * @module core/registry
 */

import {
    FacetDefinition,
    ContractDefinition,
} from '@scripts/infrastructure/types'

// Re-export auto-generated registries and constants
export {
    FACET_REGISTRY,
    CONTRACT_REGISTRY,
    ROLES,
} from '@scripts/infrastructure/registry.generated'

// Import for helper functions
import {
    FACET_REGISTRY,
    CONTRACT_REGISTRY,
} from '@scripts/infrastructure/registry.generated'

/**
 * Get facet definition by name.
 *
 * @param name - Facet name (e.g., 'AccessControlFacet')
 * @returns FacetDefinition if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const facet = getFacetDefinition('AccessControlFacet')
 * if (facet) {
 *   console.log(facet.name) // 'AccessControlFacet'
 *   console.log(facet.description) // 'Role-based access control...'
 * }
 * ```
 */
export function getFacetDefinition(name: string): FacetDefinition | undefined {
    return FACET_REGISTRY[name]
}

/**
 * Get contract definition by name.
 *
 * @param name - Contract name (e.g., 'BusinessLogicResolver')
 * @returns ContractDefinition if found, undefined otherwise
 */
export function getContractDefinition(
    name: string
): ContractDefinition | undefined {
    return CONTRACT_REGISTRY[name]
}

/**
 * Get all facets.
 *
 * @returns Array of all FacetDefinitions
 *
 * @example
 * ```typescript
 * const allFacets = getAllFacets()
 * console.log(`Total facets: ${allFacets.length}`)
 * ```
 */
export function getAllFacets(): FacetDefinition[] {
    return Object.values(FACET_REGISTRY)
}

/**
 * Get all contracts.
 *
 * @returns Array of all ContractDefinitions
 */
export function getAllContracts(): ContractDefinition[] {
    return Object.values(CONTRACT_REGISTRY)
}

/**
 * Check if a facet exists in the registry.
 *
 * @param name - Facet name to check
 * @returns true if facet exists, false otherwise
 */
export function hasFacet(name: string): boolean {
    return name in FACET_REGISTRY
}

/**
 * Check if a contract exists in the registry.
 *
 * @param name - Contract name to check
 * @returns true if contract exists, false otherwise
 */
export function hasContract(name: string): boolean {
    return name in CONTRACT_REGISTRY
}
