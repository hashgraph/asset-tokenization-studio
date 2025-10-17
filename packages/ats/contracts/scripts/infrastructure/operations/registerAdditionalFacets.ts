// SPDX-License-Identifier: Apache-2.0

/**
 * Register additional facets in existing BLR.
 *
 * This operation enables downstream projects to register custom facets
 * in an existing BusinessLogicResolver by:
 * 1. Querying all currently registered facets
 * 2. Merging them with new facets
 * 3. Calling registerBusinessLogics() with the complete list
 *
 * Works within BLR's constraint that ALL facets must be re-registered.
 *
 * @module infrastructure/operations/registerAdditionalFacets
 */

import { Overrides, ethers } from 'ethers'
import {
    DeploymentProvider,
    debug,
    error as logError,
    extractRevertReason,
    formatGasUsage,
    info,
    section,
    success,
    validateAddress,
    waitForTransaction,
    warn,
    DEFAULT_TRANSACTION_TIMEOUT,
} from '@scripts/infrastructure'
import type { RegisterFacetsResult } from './registerFacets'

/**
 * Options for registering additional facets.
 */
export interface RegisterAdditionalFacetsOptions {
    /** Address of BusinessLogicResolver */
    blrAddress: string

    /** New facets to register (facet name -> deployed address) */
    newFacets: Record<string, string>

    /** Network */
    network?: string

    /** Transaction overrides */
    overrides?: Overrides

    /** Whether to allow overwriting existing facets with different addresses */
    allowOverwrite?: boolean

    /** Maximum number of existing facets to query (default: 1000) */
    maxExistingFacets?: number
}

/**
 * Internal representation of a facet.
 */
interface FacetEntry {
    name: string
    key: string
    address: string
}

/**
 * Register additional facets in an existing BLR.
 *
 * This operation automatically queries existing facets, merges them with
 * new facets, and registers the complete list. This works around BLR's
 * constraint that ALL previously registered facets must be re-registered.
 *
 * @param provider - Deployment provider
 * @param options - Registration options
 * @returns Registration result
 * @throws Error if registration fails
 *
 * @example
 * ```typescript
 * import { registerAdditionalFacets } from '@scripts/infrastructure'
 *
 * // Downstream project registers 3 custom facets
 * const result = await registerAdditionalFacets(provider, {
 *   blrAddress: '0x123...',  // Existing ATS BLR
 *   newFacets: {
 *     'MyCustomComplianceFacet': '0xabc...',
 *     'MyRewardsFacet': '0xdef...',
 *     'MyGovernanceFacet': '0x789...'
 *   }
 * })
 *
 * if (result.success) {
 *   console.log(`Total facets registered: ${result.registered.length}`)
 * }
 * ```
 */
export async function registerAdditionalFacets(
    provider: DeploymentProvider,
    options: RegisterAdditionalFacetsOptions
): Promise<RegisterFacetsResult> {
    const {
        blrAddress,
        newFacets,
        network: _network,
        overrides = {},
        allowOverwrite = false,
        maxExistingFacets = 1000,
    } = options

    const registered: string[] = []
    const failed: string[] = []

    try {
        section(`Registering Additional Facets in BLR`)

        // Validate BLR address
        validateAddress(blrAddress, 'BusinessLogicResolver address')

        info(`BLR Address: ${blrAddress}`)
        info(`New facets to register: ${Object.keys(newFacets).length}`)

        // Validate that we have at least one new facet
        if (Object.keys(newFacets).length === 0) {
            warn('No new facets to register')
            return {
                success: true,
                blrAddress,
                registered: [],
                failed: [],
            }
        }

        // Get BLR contract instance
        const blrFactory = await provider.getFactory('BusinessLogicResolver')
        const blr = blrFactory.attach(blrAddress)

        // Verify BLR contract exists
        const ethProvider = provider.getProvider()
        const blrCode = await ethProvider.getCode(blrAddress)
        if (blrCode === '0x') {
            throw new Error(`No contract found at BLR address ${blrAddress}`)
        }

        // ========================================
        // STEP 1: Query existing facets from BLR
        // ========================================
        info('\n📋 Querying existing facets from BLR...')

        const existingFacetsMap = new Map<string, FacetEntry>()

        // Get total count of registered facets
        const facetCount = await blr.getBusinessLogicCount()
        info(`   Found ${facetCount} existing facets in BLR`)

        if (facetCount > maxExistingFacets) {
            warn(
                `   Warning: BLR has ${facetCount} facets, but maxExistingFacets is ${maxExistingFacets}`
            )
            warn(`   Only first ${maxExistingFacets} facets will be queried`)
        }

        // Query facet keys in batches (pagination)
        const batchSize = 100
        const totalToQuery = Math.min(facetCount, maxExistingFacets)
        const numBatches = Math.ceil(totalToQuery / batchSize)

        for (let batch = 0; batch < numBatches; batch++) {
            const facetKeys = await blr.getBusinessLogicKeys(batch, batchSize)

            // Resolve address for each facet key
            for (const facetKey of facetKeys) {
                try {
                    const facetAddress =
                        await blr.resolveLatestBusinessLogic(facetKey)

                    // Store with key as identifier
                    existingFacetsMap.set(facetKey, {
                        name: '', // Name unknown (only have key)
                        key: facetKey,
                        address: facetAddress,
                    })
                } catch (err) {
                    debug(`   Failed to resolve facet ${facetKey}: ${err}`)
                }
            }
        }

        info(
            `   Successfully queried ${existingFacetsMap.size} existing facets`
        )

        // ========================================
        // STEP 2: Process new facets
        // ========================================
        info('\n📦 Processing new facets...')

        const newFacetsMap = new Map<string, FacetEntry>()
        const conflicts: string[] = []

        for (const [facetName, facetAddress] of Object.entries(newFacets)) {
            try {
                validateAddress(facetAddress, `${facetName} address`)

                // Verify facet contract exists
                const facetCode = await ethProvider.getCode(facetAddress)
                if (facetCode === '0x') {
                    warn(
                        `   ✗ ${facetName}: No contract at address ${facetAddress}`
                    )
                    failed.push(facetName)
                    continue
                }

                // Generate facet key (same as BLR: keccak256(baseName))
                const baseName = facetName.replace(/TimeTravel$/, '')
                const facetKey = ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes(baseName)
                )

                // Check for conflicts with existing facets
                if (existingFacetsMap.has(facetKey)) {
                    const existing = existingFacetsMap.get(facetKey)!
                    if (
                        existing.address.toLowerCase() !==
                        facetAddress.toLowerCase()
                    ) {
                        if (!allowOverwrite) {
                            conflicts.push(facetName)
                            logError(
                                `   ✗ ${facetName}: Already registered at ${existing.address}, ` +
                                    `cannot overwrite with ${facetAddress}`
                            )
                            failed.push(facetName)
                            continue
                        } else {
                            warn(
                                `   ⚠️  ${facetName}: Overwriting ${existing.address} → ${facetAddress}`
                            )
                        }
                    } else {
                        info(
                            `   ℹ️  ${facetName}: Already registered at same address, updating`
                        )
                    }
                }

                newFacetsMap.set(facetKey, {
                    name: facetName,
                    key: facetKey,
                    address: facetAddress,
                })

                info(`   ✓ ${facetName}: ${facetAddress}`)
            } catch (err) {
                const errorMessage = extractRevertReason(err)
                warn(`   Validation failed for ${facetName}: ${errorMessage}`)
                failed.push(facetName)
            }
        }

        if (conflicts.length > 0 && !allowOverwrite) {
            throw new Error(
                `Cannot register: ${conflicts.length} facet(s) already exist with different addresses. ` +
                    `Use allowOverwrite=true to force update.`
            )
        }

        // Check if we have any valid new facets to register
        if (newFacetsMap.size === 0) {
            if (failed.length > 0) {
                throw new Error('All new facets failed validation')
            } else {
                success('No new facets to register (all already registered)')
                return {
                    success: true,
                    blrAddress,
                    registered: [],
                    failed: [],
                }
            }
        }

        // ========================================
        // STEP 3: Merge existing + new facets
        // ========================================
        info('\n🔀 Merging existing and new facets...')

        // Start with all existing facets
        const mergedFacetsMap = new Map(existingFacetsMap)

        // Add/update with new facets
        for (const [key, facet] of newFacetsMap) {
            mergedFacetsMap.set(key, facet)
        }

        const totalFacets = mergedFacetsMap.size
        const existingCount = existingFacetsMap.size
        const newCount = newFacetsMap.size

        info(`   Existing facets: ${existingCount}`)
        info(`   New facets: ${newCount}`)
        info(`   Total facets to register: ${totalFacets}`)

        // ========================================
        // STEP 4: Register all facets in BLR
        // ========================================
        info('\n📝 Registering all facets in BLR...')

        // Prepare BusinessLogicRegistryData array
        const businessLogics = Array.from(mergedFacetsMap.values()).map(
            (facet) => ({
                businessLogicKey: facet.key,
                businessLogicAddress: facet.address,
            })
        )

        const tx = await blr.registerBusinessLogics(businessLogics, overrides)

        info(`   Registration transaction sent: ${tx.hash}`)

        const receipt = await waitForTransaction(
            tx,
            1,
            DEFAULT_TRANSACTION_TIMEOUT
        )

        const gasUsed = formatGasUsage(receipt, tx.gasLimit)
        debug(`   ${gasUsed}`)

        // Track registered facets
        for (const facet of mergedFacetsMap.values()) {
            if (facet.name) {
                registered.push(facet.name)
            }
        }

        // ========================================
        // Success summary
        // ========================================
        success(`\n✅ Successfully registered ${totalFacets} facets`)
        info(`   • Existing facets re-registered: ${existingCount}`)
        info(`   • New facets added: ${newCount}`)

        if (newCount > 0) {
            info('\n   New facets:')
            for (const facet of newFacetsMap.values()) {
                info(`     • ${facet.name}`)
            }
        }

        if (failed.length > 0) {
            warn(`\n   ⚠️  Failed to register ${failed.length} facets:`)
            for (const facetName of failed) {
                warn(`     • ${facetName}`)
            }
        }

        return {
            success: true,
            blrAddress,
            registered,
            failed,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toNumber(),
        }
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`\n❌ Additional facet registration failed: ${errorMessage}`)

        return {
            success: false,
            blrAddress,
            registered,
            failed: Object.keys(newFacets).filter(
                (name) => !registered.includes(name)
            ),
            error: errorMessage,
        }
    }
}
