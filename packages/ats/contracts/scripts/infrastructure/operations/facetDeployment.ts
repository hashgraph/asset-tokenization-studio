// SPDX-License-Identifier: Apache-2.0

/**
 * Facet deployment module.
 *
 * High-level operation for deploying multiple facets with support for
 * TimeTravel variants, layer-based ordering, and dependency management.
 *
 * @module core/operations/facetDeployment
 */

import { ContractFactory, Overrides } from 'ethers'
import {
    DeploymentResult,
    deployContract,
    info,
    section,
    success,
    warn,
} from '@scripts/infrastructure'

/**
 * Options for deploying facets (all optional).
 */
export interface DeployFacetsOptions {
    /**
     * Number of confirmations to wait for each deployment.
     * Default: 1
     */
    confirmations?: number

    /**
     * Transaction overrides for all deployments.
     */
    overrides?: Overrides
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
 * Deploy multiple facets using provided ContractFactory instances.
 *
 * This operation takes a map of facet names to their ContractFactory instances
 * and deploys each facet. Follows the factory-first pattern established in
 * deployContract.ts.
 *
 * **Note**: Factories already have signers connected. The signer from each
 * factory will be used for deployment.
 *
 * @param facetFactories - Map of facet name to ContractFactory (with signer already connected)
 * @param options - Optional deployment configuration
 * @returns Deployment results
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 * import {
 *   AccessControlFacet__factory,
 *   KycFacet__factory,
 *   PauseFacet__factory,
 * } from '@contract-types'
 *
 * const signer = provider.getSigner()
 *
 * // Create factories for facets to deploy (signer already connected)
 * const facetFactories = {
 *   'AccessControlFacet': new AccessControlFacet__factory(signer),
 *   'KycFacet': new KycFacet__factory(signer),
 *   'PauseFacet': new PauseFacet__factory(signer),
 * }
 *
 * // Deploy all facets with optional configuration
 * const result = await deployFacets(facetFactories, {
 *   confirmations: 2,
 *   overrides: { gasLimit: 5000000 }
 * })
 *
 * console.log(`Deployed ${result.deployed.size} facets`)
 * console.log(`Failed ${result.failed.size} facets`)
 * ```
 */
export async function deployFacets(
    facetFactories: Record<string, ContractFactory>,
    options: DeployFacetsOptions = {}
): Promise<DeployFacetsResult> {
    const { confirmations = 1, overrides = {} } = options

    section('Deploying Facets')

    const deployed = new Map<string, DeploymentResult>()
    const failed = new Map<string, string>()
    const skipped = new Map<string, string>()

    try {
        const facetNames = Object.keys(facetFactories)

        if (facetNames.length === 0) {
            warn('No facets to deploy')
            return {
                success: true,
                deployed,
                failed,
                skipped,
            }
        }

        info(`Total facets to deploy: ${facetNames.length}`)

        // Deploy each facet using its factory
        for (const facetName of facetNames) {
            const factory = facetFactories[facetName]

            try {
                info(`Deploying ${facetName}...`)

                // Deploy using the factory (signer already connected to factory)
                const result = await deployContract(factory, {
                    confirmations,
                    overrides,
                })

                if (result.success && result.address) {
                    deployed.set(facetName, result)
                } else {
                    failed.set(facetName, result.error || 'Unknown error')
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : String(err)
                failed.set(facetName, `Failed to deploy: ${errorMessage}`)
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
