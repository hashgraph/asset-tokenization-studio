import {
    DeploymentProvider,
    DeploymentResult,
    deployContract,
    getAllFacets,
    getFacetDefinition,
    info,
    resolveContractName,
    section,
    success,
    warn,
} from '@scripts/infrastructure'
// SPDX-License-Identifier: Apache-2.0

/**
 * Facet deployment module.
 *
 * High-level operation for deploying multiple facets with support for
 * TimeTravel variants, layer-based ordering, and dependency management.
 *
 * @module core/operations/facetDeployment
 */

/**
 * Options for deploying facets.
 */
export interface DeployFacetsOptions {
    /** Specific facet names to deploy (if not provided, deploys all facets) */
    facetNames?: string[]

    /** Whether to deploy TimeTravel variants instead of regular facets */
    useTimeTravel?: boolean

    /** Network */
    network?: string
}

/**
 * Result of deploying facets.
 */
export interface DeployFacetsResult {
    /** Whether all deployments succeeded */
    success: boolean

    /** Successfully deployed facets (name -> result) */
    deployed: Map<string, DeploymentResult>

    /** Failed facets (name -> error) */
    failed: Map<string, string>

    /** Skipped facets (name -> reason) */
    skipped: Map<string, string>
}

/**
 * Deploy multiple facets.
 *
 * This module orchestrates the deployment of multiple facets with support
 * for filtering, layer ordering, and dependency management.
 *
 * @param provider - Deployment provider
 * @param options - Deployment options
 * @returns Deployment results
 *
 * @example
 * ```typescript
 * // Deploy all facets
 * const result = await deployFacets(provider)
 *
 * // Deploy specific facets with TimeTravel variants
 * const result = await deployFacets(provider, {
 *   facetNames: ['AccessControlFacet', 'KycFacet'],
 *   useTimeTravel: true
 * })
 * ```
 */
export async function deployFacets(
    provider: DeploymentProvider,
    options: DeployFacetsOptions = {}
): Promise<DeployFacetsResult> {
    const { facetNames, useTimeTravel = false, network: _network } = options

    section('Deploying Facets')

    const deployed = new Map<string, DeploymentResult>()
    const failed = new Map<string, string>()
    const skipped = new Map<string, string>()

    try {
        // Determine which facets to deploy
        let facetsToDeployDefs

        if (facetNames && facetNames.length > 0) {
            // Deploy specific facets
            facetsToDeployDefs = facetNames
                .map((name) => getFacetDefinition(name))
                .filter((def) => def !== undefined)

            const missingFacets = facetNames.filter(
                (name) => !getFacetDefinition(name)
            )
            if (missingFacets.length > 0) {
                warn(
                    `Facets not found in registry: ${missingFacets.join(', ')}`
                )
            }
        } else {
            // Deploy all facets
            facetsToDeployDefs = getAllFacets()
            info('Deploying all facets')
        }

        if (facetsToDeployDefs.length === 0) {
            warn('No facets to deploy')
            return {
                success: true,
                deployed,
                failed,
                skipped,
            }
        }

        info(`Total facets to deploy: ${facetsToDeployDefs.length}`)

        // Deploy each facet
        for (const facetDef of facetsToDeployDefs) {
            const facetName = facetDef.name

            // Determine contract name (regular or TimeTravel variant)
            const contractName = resolveContractName(facetName, useTimeTravel)

            // Deploy facet
            info(`Deploying ${facetName} (${contractName})...`)

            const result = await deployContract(provider, {
                contractName,
                confirmations: 1,
            })

            if (result.success && result.address) {
                deployed.set(contractName, result)
            } else {
                failed.set(contractName, result.error || 'Unknown error')
            }
        }

        const allSucceeded = failed.size === 0

        if (allSucceeded) {
            success(
                `Successfully deployed ${deployed.size} facets${
                    skipped.size > 0 ? ` (${skipped.size} skipped)` : ''
                }`
            )
        } else {
            warn(`Deployed ${deployed.size} facets, ${failed.size} failed`)
        }

        return {
            success: allSucceeded,
            deployed,
            failed,
            skipped,
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        throw new Error(`Facet deployment failed: ${errorMessage}`)
    }
}

/**
 * Get deployment summary for facets.
 *
 * @param result - Deployment result
 * @returns Summary object
 */
export function getFacetDeploymentSummary(result: DeployFacetsResult): {
    deployed: string[]
    failed: string[]
    skipped: string[]
    addresses: Record<string, string>
} {
    return {
        deployed: Array.from(result.deployed.keys()),
        failed: Array.from(result.failed.keys()),
        skipped: Array.from(result.skipped.keys()),
        addresses: Object.fromEntries(
            Array.from(result.deployed.entries())
                .filter(([_, r]) => r.address)
                .map(([name, r]) => [name, r.address!])
        ),
    }
}
