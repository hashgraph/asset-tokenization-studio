// SPDX-License-Identifier: Apache-2.0

/**
 * Registry combination utilities.
 *
 * Provides utilities for combining multiple registry providers, enabling
 * downstream projects to merge ATS facets with custom facets seamlessly.
 *
 * @module infrastructure/combineRegistries
 *
 * @example
 * ```typescript
 * import { combineRegistries } from '@hashgraph/asset-tokenization-contracts/scripts'
 * import { atsRegistry } from '@hashgraph/asset-tokenization-contracts/scripts'
 * import { customRegistry } from './myCustomFacets'
 *
 * // Combine registries
 * const combined = combineRegistries(atsRegistry, customRegistry)
 *
 * // Use with registerFacets
 * await registerFacets(provider, {
 *   blrAddress: '0x...',
 *   facets: {
 *     'AccessControlFacet': '0xabc...',  // From ATS
 *     'CustomFacet': '0xdef...'          // From custom registry
 *   },
 *   registry: combined
 * })
 * ```
 */

import type { RegistryProvider, FacetDefinition } from './types'
import { warn } from './utils/logging'

/**
 * Conflict resolution strategy when combining registries with duplicate facet names.
 */
export type ConflictStrategy =
    | 'error' // Throw error on conflicts (strict)
    | 'warn' // Log warning, last registry wins (permissive)
    | 'first' // First registry wins, ignore subsequent (conservative)
    | 'last' // Last registry wins, overwrite previous (aggressive)

/**
 * Options for combining registries.
 */
export interface CombineRegistriesOptions {
    /**
     * How to handle duplicate facet names across registries.
     * @default 'warn' - Log warning and use last registry's definition
     */
    onConflict?: ConflictStrategy
}

/**
 * Combine multiple registry providers into a single unified registry.
 *
 * This function merges multiple RegistryProvider instances, allowing downstream
 * projects to use both ATS facets and custom facets in the same deployment.
 *
 * **Conflict Resolution:**
 * - `error`: Throws an error if any facet name appears in multiple registries
 * - `warn`: Logs a warning and uses the last registry's definition (default)
 * - `first`: Uses the first registry's definition, ignores subsequent
 * - `last`: Uses the last registry's definition, overwrites previous
 *
 * @param registries - Registries to combine (order matters for conflict resolution)
 * @param options - Combination options (optional)
 * @returns Combined registry provider
 * @throws Error if registries conflict and strategy is 'error'
 *
 * @example Basic usage
 * ```typescript
 * const combined = combineRegistries(atsRegistry, customRegistry)
 * ```
 *
 * @example Strict conflict checking
 * ```typescript
 * const combined = combineRegistries(
 *   atsRegistry,
 *   customRegistry,
 *   { onConflict: 'error' }
 * )
 * ```
 *
 * @example Conservative merging (prefer ATS definitions)
 * ```typescript
 * const combined = combineRegistries(
 *   atsRegistry,
 *   customRegistry,
 *   { onConflict: 'first' }
 * )
 * ```
 */
// Function overloads
// eslint-disable-next-line no-redeclare
export function combineRegistries(
    ...registries: RegistryProvider[]
): RegistryProvider
// eslint-disable-next-line no-redeclare
export function combineRegistries(
    ...args: [...RegistryProvider[], CombineRegistriesOptions]
): RegistryProvider
// Implementation
// eslint-disable-next-line no-redeclare
export function combineRegistries(
    ...args: Array<RegistryProvider | CombineRegistriesOptions>
): RegistryProvider {
    // Parse arguments (last arg might be options)
    const lastArg = args[args.length - 1]
    const hasOptions =
        lastArg &&
        typeof lastArg === 'object' &&
        'onConflict' in lastArg &&
        !('getFacetDefinition' in lastArg)

    const registries = hasOptions
        ? (args.slice(0, -1) as RegistryProvider[])
        : (args as RegistryProvider[])
    const options: CombineRegistriesOptions = hasOptions
        ? (lastArg as CombineRegistriesOptions)
        : {}

    const { onConflict = 'warn' } = options

    if (registries.length === 0) {
        throw new Error('combineRegistries requires at least one registry')
    }

    if (registries.length === 1) {
        return registries[0]
    }

    // Track facet definitions and conflicts
    const combinedFacets = new Map<string, FacetDefinition>()
    const conflicts: Array<{ facetName: string; registryIndex: number }> = []

    // Merge facets from all registries
    for (let i = 0; i < registries.length; i++) {
        const registry = registries[i]
        const facets = registry.getAllFacets()

        for (const facet of facets) {
            const existing = combinedFacets.get(facet.name)

            if (existing) {
                // Conflict detected
                conflicts.push({ facetName: facet.name, registryIndex: i })

                switch (onConflict) {
                    case 'error':
                        throw new Error(
                            `Registry conflict: Facet '${facet.name}' appears in multiple registries. ` +
                                `Use onConflict option to specify resolution strategy.`
                        )

                    case 'warn':
                        warn(
                            `Registry conflict: Facet '${facet.name}' appears in registry ${i}. Using last definition.`
                        )
                        combinedFacets.set(facet.name, facet)
                        break

                    case 'first':
                        // Keep first, ignore subsequent
                        break

                    case 'last':
                        // Overwrite with last
                        combinedFacets.set(facet.name, facet)
                        break
                }
            } else {
                // No conflict, add facet
                combinedFacets.set(facet.name, facet)
            }
        }
    }

    // Create combined registry provider
    return {
        getFacetDefinition(name: string): FacetDefinition | undefined {
            return combinedFacets.get(name)
        },

        getAllFacets(): FacetDefinition[] {
            return Array.from(combinedFacets.values())
        },
    }
}

/**
 * Check if registries have any conflicting facet names.
 *
 * Useful for validating registries before combining them.
 *
 * @param registries - Registries to check
 * @returns Array of conflicting facet names (empty if no conflicts)
 *
 * @example
 * ```typescript
 * const conflicts = getRegistryConflicts(atsRegistry, customRegistry)
 * if (conflicts.length > 0) {
 *   console.warn('Conflicting facets:', conflicts)
 * }
 * ```
 */
export function getRegistryConflicts(
    ...registries: RegistryProvider[]
): string[] {
    const seenFacets = new Set<string>()
    const conflicts = new Set<string>()

    for (const registry of registries) {
        const facets = registry.getAllFacets()
        for (const facet of facets) {
            if (seenFacets.has(facet.name)) {
                conflicts.add(facet.name)
            }
            seenFacets.add(facet.name)
        }
    }

    return Array.from(conflicts)
}
