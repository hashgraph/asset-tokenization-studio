// SPDX-License-Identifier: Apache-2.0

/**
 * Register facets operation.
 *
 * Atomic operation for registering facets in BusinessLogicResolver (BLR)
 * for diamond pattern upgrades.
 *
 * @module core/operations/registerFacets
 */

import { Overrides } from 'ethers'
import { BusinessLogicResolver } from '@contract-types'
import {
    DEFAULT_TRANSACTION_TIMEOUT,
    RegistryProvider,
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
} from '@scripts/infrastructure'
import { combineRegistries } from '../combineRegistries'

/**
 * Resolve registry from registries array.
 *
 * Combines multiple registries automatically using combineRegistries utility.
 *
 * @param registries - Array of registry providers
 * @returns Resolved registry provider
 * @throws Error if no registries provided
 *
 * @internal
 */
function resolveRegistry(registries: RegistryProvider[]): RegistryProvider {
    if (!registries || registries.length === 0) {
        throw new Error(
            'No registries provided. Specify "registries" parameter. ' +
                'Registry is required to get resolver keys for facets.'
        )
    }

    if (registries.length === 1) {
        return registries[0]
    }

    // Combine multiple registries
    return combineRegistries(...registries)
}

/**
 * Options for registering facets in BLR.
 */
export interface RegisterFacetsOptions {
    /** Facets to register (facet name -> deployed address) */
    facets: Record<string, string>

    /** Transaction overrides */
    overrides?: Overrides

    /** Whether to verify facets exist before registration */
    verify?: boolean

    /**
     * Registry providers to get resolver keys from contracts.
     * For single registry, pass an array with one element.
     * For multiple registries (e.g., ATS + custom), pass array with multiple elements.
     * Automatically combines registries using combineRegistries utility.
     * @see combineRegistries for conflict resolution options
     */
    registries: RegistryProvider[]
}

/**
 * Result of registering facets.
 */
export interface RegisterFacetsResult {
    /** Whether registration succeeded */
    success: boolean

    /** BLR address */
    blrAddress: string

    /** Successfully registered facets */
    registered: string[]

    /** Failed facets */
    failed: string[]

    /** Transaction hash (only if success=true) */
    transactionHash?: string

    /** Block number (only if success=true) */
    blockNumber?: number

    /** Gas used (only if success=true) */
    gasUsed?: number

    /** Error message (only if success=false) */
    error?: string
}

/**
 * Register facets in BusinessLogicResolver.
 *
 * This operation registers deployed facet contracts with the BLR,
 * making them available for use in diamond pattern upgrades.
 *
 * **Multi-Registry Support:**
 * Downstream projects can combine ATS facets with custom facets by passing
 * multiple registries in the `registries` array.
 *
 * @param blr - Typed BusinessLogicResolver contract instance
 * @param options - Registration options
 * @returns Registration result
 * @throws Error if registration fails
 *
 * @example Single registry
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@contract-types'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x123...', signer)
 *
 * const result = await registerFacets(blr, {
 *   facets: {
 *     'AccessControlFacet': '0xabc...',
 *     'KycFacet': '0xdef...',
 *     'PauseFacet': '0x789...'
 *   },
 *   registries: [atsRegistry]
 * })
 * console.log(`Registered ${result.registered.length} facets`)
 * ```
 *
 * @example Multiple registries (ATS + custom)
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@contract-types'
 * import { atsRegistry } from '@hashgraph/asset-tokenization-contracts/scripts'
 * import { customRegistry } from './myRegistry'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x123...', signer)
 *
 * const result = await registerFacets(blr, {
 *   facets: {
 *     'AccessControlFacet': '0xabc...',  // From ATS
 *     'CustomFacet': '0xdef...'          // From custom registry
 *   },
 *   registries: [atsRegistry, customRegistry]
 * })
 * ```
 */
export async function registerFacets(
    blr: BusinessLogicResolver,
    options: RegisterFacetsOptions
): Promise<RegisterFacetsResult> {
    const { facets, overrides = {}, verify = true, registries } = options

    // Get BLR address from contract instance
    const blrAddress = blr.address

    const registered: string[] = []
    const failed: string[] = []

    try {
        section(`Registering Facets in BLR`)

        // Get provider from BLR contract
        if (!blr.provider) {
            throw new Error(
                'BusinessLogicResolver must be connected to a signer with a provider. ' +
                    'Use BusinessLogicResolver__factory.connect(address, signer) where signer has a provider.'
            )
        }

        const provider = blr.provider

        // Resolve registry (combine if multiple)
        const registry = resolveRegistry(registries)

        // Validate BLR address
        validateAddress(blrAddress, 'BusinessLogicResolver address')

        if (verify) {
            const blrCode = await provider.getCode(blrAddress)
            if (blrCode === '0x') {
                throw new Error(
                    `No contract found at BLR address ${blrAddress}`
                )
            }
        }

        info(`BLR Address: ${blrAddress}`)
        info(`Facets to register: ${Object.keys(facets).length}`)

        // Handle empty facet registration
        if (Object.keys(facets).length === 0) {
            success('No facets to register')
            return {
                success: true,
                blrAddress,
                registered: [],
                failed: [],
            }
        }

        // Validate all facets before registering
        for (const [facetName, facetAddress] of Object.entries(facets)) {
            try {
                validateAddress(facetAddress, `${facetName} address`)

                if (verify) {
                    const facetCode = await provider.getCode(facetAddress)
                    if (facetCode === '0x') {
                        warn(
                            `No contract found at ${facetName} address ${facetAddress}`
                        )
                        failed.push(facetName)
                        continue
                    }
                }

                debug(`${facetName}: ${facetAddress}`)
            } catch (err) {
                const errorMessage = extractRevertReason(err)
                warn(`Validation failed for ${facetName}: ${errorMessage}`)
                failed.push(facetName)
            }
        }

        // Stop if all facets failed validation
        if (failed.length === Object.keys(facets).length) {
            throw new Error('All facets failed validation')
        }

        // Prepare arrays for batch registration
        const facetNames: string[] = []
        const facetAddresses: string[] = []

        for (const [facetName, facetAddress] of Object.entries(facets)) {
            if (!failed.includes(facetName)) {
                facetNames.push(facetName)
                facetAddresses.push(facetAddress)
            }
        }

        // Register facets
        info(`Registering ${facetNames.length} facets...`)

        // Prepare BusinessLogicRegistryData array
        // Get resolver keys from registry (contract constants), not generated from name
        const businessLogics = facetNames.map((name, index) => {
            // Strip "TimeTravel" suffix if present to get canonical facet name
            const baseName = name.replace(/TimeTravel$/, '')

            // Get resolver key from registry
            const definition = registry.getFacetDefinition(baseName)
            if (!definition) {
                throw new Error(
                    `Facet ${baseName} not found in registry. ` +
                        `All facets must be in the registry to get their resolver keys.`
                )
            }
            if (!definition.resolverKey || !definition.resolverKey.value) {
                throw new Error(
                    `Facet ${baseName} found in registry but missing resolverKey.value.`
                )
            }

            return {
                businessLogicKey: definition.resolverKey.value,
                businessLogicAddress: facetAddresses[index],
            }
        })

        const tx = await blr.registerBusinessLogics(businessLogics, overrides)

        info(`Registration transaction sent: ${tx.hash}`)

        const receipt = await waitForTransaction(
            tx,
            1,
            DEFAULT_TRANSACTION_TIMEOUT
        )

        const gasUsed = formatGasUsage(receipt, tx.gasLimit)
        debug(gasUsed)

        registered.push(...facetNames)

        success(`Successfully registered ${registered.length} facets`)
        for (const facetName of registered) {
            info(`  ✓ ${facetName}`)
        }

        if (failed.length > 0) {
            warn(`Failed to register ${failed.length} facets:`)
            for (const facetName of failed) {
                warn(`  ✗ ${facetName}`)
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
        logError(`Facet registration failed: ${errorMessage}`)

        return {
            success: false,
            blrAddress,
            registered,
            failed: Object.keys(facets).filter(
                (name) => !registered.includes(name)
            ),
            error: errorMessage,
        }
    }
}

/**
 * Register a single facet in BLR.
 *
 * Convenience function for registering one facet at a time.
 *
 * @param blr - Typed BusinessLogicResolver contract instance
 * @param facetName - Facet name
 * @param facetAddress - Facet deployed address
 * @param registries - Registry providers
 * @param overrides - Transaction overrides
 * @returns Registration result
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@contract-types'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x123...', signer)
 *
 * const result = await registerFacet(
 *   blr,
 *   'AccessControlFacet',
 *   '0xabc...',
 *   [atsRegistry]
 * )
 * ```
 */
export async function registerFacet(
    blr: BusinessLogicResolver,
    facetName: string,
    facetAddress: string,
    registries: RegistryProvider[],
    overrides: Overrides = {}
): Promise<RegisterFacetsResult> {
    return registerFacets(blr, {
        facets: { [facetName]: facetAddress },
        registries,
        overrides,
    })
}
