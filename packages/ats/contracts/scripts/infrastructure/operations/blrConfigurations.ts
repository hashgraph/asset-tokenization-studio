// SPDX-License-Identifier: Apache-2.0

/**
 * BLR Configuration operations.
 *
 * Atomic operations for creating and querying configurations in BusinessLogicResolver (BLR)
 * that define which facets are used for different token types.
 *
 * These are generic operations that work with any configuration ID and facet set.
 * Domain-specific configuration creation (equity, bond) is handled by modules.
 *
 * @module core/operations/blrConfigurations
 */

import { Overrides } from 'ethers'
import {
    DEFAULT_TRANSACTION_TIMEOUT,
    DeploymentProvider,
    OperationResult,
    validateAddress,
    validateBytes32,
    extractRevertReason,
    info,
    success,
    section,
    debug,
    error as logError,
    formatGasUsage,
    waitForTransaction,
} from '@scripts/infrastructure'

/**
 * Facet configuration for BLR.
 */
export interface FacetConfiguration {
    /** Facet name */
    facetName: string

    /** Function selectors this facet handles */
    selectors: string[]
}

/**
 * Options for creating a BLR configuration.
 */
export interface CreateBlrConfigurationOptions {
    /** Address of BusinessLogicResolver */
    blrAddress: string

    /** Configuration ID (bytes32, any config ID) */
    configurationId: string

    /** Facet configurations for this config */
    facets: FacetConfiguration[]

    /** Whether this is the final batch (for batch creation) */
    isFinalBatch?: boolean

    /** Network */
    network?: string

    /** Transaction overrides */
    overrides?: Overrides

    /** Whether to verify BLR exists before configuration */
    verify?: boolean
}

/**
 * Result of BLR configuration.
 */
export interface CreateBlrConfigurationResult {
    /** Whether configuration succeeded */
    success: boolean

    /** BLR address */
    blrAddress: string

    /** Configuration ID */
    configurationId: string

    /** Configuration version created */
    version?: number

    /** Number of facets configured */
    facetCount: number

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
 * Create a configuration in BLR (generic operation).
 *
 * This operation defines which facets and function selectors are used
 * for a specific configuration ID. Works with any configuration ID, not
 * limited to equity or bond.
 *
 * @param provider - Deployment provider
 * @param options - Configuration options
 * @returns Configuration result
 *
 * @example
 * ```typescript
 * // Can be used with any configuration ID
 * const result = await createBlrConfiguration(provider, {
 *   blrAddress: '0x123...',
 *   configurationId: '0x00...01', // Any bytes32 config ID
 *   facets: [
 *     {
 *       facetName: 'AccessControlFacet',
 *       selectors: ['0x12345678', '0x9abcdef0']
 *     },
 *     {
 *       facetName: 'KycFacet',
 *       selectors: ['0xabcdef12']
 *     }
 *   ]
 * })
 * console.log(`Created configuration version ${result.version}`)
 * ```
 */
export async function createBlrConfiguration(
    provider: DeploymentProvider,
    options: CreateBlrConfigurationOptions
): Promise<CreateBlrConfigurationResult> {
    const {
        blrAddress,
        configurationId,
        facets,
        isFinalBatch = true,
        network: _network,
        overrides = {},
        verify = true,
    } = options

    try {
        section(`Configuring BLR`)

        // Validate inputs
        validateAddress(blrAddress, 'BusinessLogicResolver address')
        validateBytes32(configurationId, 'configuration ID')

        if (facets.length === 0) {
            throw new Error('At least one facet configuration is required')
        }

        if (verify) {
            const ethProvider = provider.getProvider()
            const blrCode = await ethProvider.getCode(blrAddress)
            if (blrCode === '0x') {
                throw new Error(
                    `No contract found at BLR address ${blrAddress}`
                )
            }
        }

        info(`BLR Address: ${blrAddress}`)
        info(`Configuration ID: ${configurationId}`)
        info(`Facets: ${facets.length}`)
        info(`Is final batch: ${isFinalBatch}`)

        // Get BLR contract instance
        const blrFactory = await provider.getFactory('BusinessLogicResolver')
        const blr = blrFactory.attach(blrAddress)

        // Prepare configuration data
        const facetConfigs = facets.map((f) => ({
            facetName: f.facetName,
            selectors: f.selectors,
        }))

        debug(`Facet configurations: ${JSON.stringify(facetConfigs, null, 2)}`)

        // Create batch configuration
        info('Creating configuration...')

        const tx = await blr.createBatchConfiguration(
            configurationId,
            facetConfigs,
            isFinalBatch,
            overrides
        )

        info(`Configuration transaction sent: ${tx.hash}`)

        const receipt = await waitForTransaction(
            tx,
            1,
            DEFAULT_TRANSACTION_TIMEOUT
        )

        const gasUsed = formatGasUsage(receipt, tx.gasLimit)
        debug(gasUsed)

        // Try to get the version from events
        let version: number | undefined

        try {
            // Parse ConfigurationCreated event to get version
            const iface = blr.interface
            const configCreatedTopic = iface.getEventTopic(
                'ConfigurationCreated'
            )

            const configLog = receipt.logs.find(
                (log) => log.topics[0] === configCreatedTopic
            )

            if (configLog) {
                const parsedLog = iface.parseLog(configLog)
                version = parsedLog.args.version?.toNumber()
            }
        } catch {
            debug('Could not parse configuration version from events')
        }

        success(`Configuration created successfully`)
        if (version !== undefined) {
            info(`  Version: ${version}`)
        }
        info(`  Configuration ID: ${configurationId}`)
        info(`  Facets: ${facets.length}`)

        return {
            success: true,
            blrAddress,
            configurationId,
            version,
            facetCount: facets.length,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toNumber(),
        }
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`BLR configuration failed: ${errorMessage}`)

        return {
            success: false,
            blrAddress,
            configurationId,
            facetCount: facets.length,
            error: errorMessage,
        }
    }
}

/**
 * Get the latest configuration version for a configuration ID.
 *
 * @param provider - Deployment provider
 * @param blrAddress - BLR address
 * @param configurationId - Configuration ID
 * @returns Latest version number
 *
 * @example
 * ```typescript
 * const version = await getConfigurationVersion(
 *   provider,
 *   '0x123...',
 *   '0x00...01' // Any config ID
 * )
 * console.log(`Latest config version: ${version}`)
 * ```
 */
export async function getConfigurationVersion(
    provider: DeploymentProvider,
    blrAddress: string,
    configurationId: string
): Promise<number> {
    try {
        validateAddress(blrAddress, 'BLR address')
        validateBytes32(configurationId, 'configuration ID')

        const blrFactory = await provider.getFactory('BusinessLogicResolver')
        const blr = blrFactory.attach(blrAddress)

        const version = await blr.getConfigurationVersion(configurationId)
        return version.toNumber()
    } catch (err) {
        logError(
            `Error getting configuration version: ${extractRevertReason(err)}`
        )
        throw err
    }
}

/**
 * Check if a configuration exists in BLR.
 *
 * @param provider - Deployment provider
 * @param blrAddress - BLR address
 * @param configurationId - Configuration ID
 * @returns true if configuration exists
 *
 * @example
 * ```typescript
 * const exists = await configurationExists(
 *   provider,
 *   '0x123...',
 *   '0x00...01' // Any config ID
 * )
 * ```
 */
export async function configurationExists(
    provider: DeploymentProvider,
    blrAddress: string,
    configurationId: string
): Promise<boolean> {
    try {
        const version = await getConfigurationVersion(
            provider,
            blrAddress,
            configurationId
        )
        return version > 0
    } catch {
        return false
    }
}

// ============================================================================
// Configuration Creation (Generic Operation for BLR Configurations)
// ============================================================================

/**
 * Error types for configuration operations.
 */
export type ConfigurationError =
    | 'EMPTY_FACET_LIST'
    | 'INVALID_ADDRESS'
    | 'INVALID_CONFIG_ID'
    | 'FACET_NOT_FOUND'
    | 'TRANSACTION_FAILED'
    | 'EVENT_PARSE_FAILED'

/**
 * Configuration data returned on success.
 */
export interface ConfigurationData {
    /** Configuration ID */
    configurationId: string

    /** Configuration version */
    version: number

    /** Facet keys and addresses */
    facetKeys: Array<{
        facetName: string
        key: string
        address: string
    }>

    /** Transaction hash */
    transactionHash: string

    /** Block number */
    blockNumber: number
}

/**
 * Create a configuration in BusinessLogicResolver (generic operation).
 *
 * This is the reusable implementation that eliminates duplication across
 * different configuration types (equity, bond, or any future configuration).
 *
 * **Implementation Steps**:
 * 1. Resolve facet names (with optional TimeTravel variants)
 * 2. Generate BLR registration keys (keccak256 of facet names)
 * 3. Filter out missing/unregistered facets
 * 4. Get latest version from BLR
 * 5. Create configuration array with facet keys and version
 * 6. Call BLR.createConfiguration()
 * 7. Extract version from DiamondConfigurationCreated event
 * 8. Return structured result with OperationResult pattern
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param options - Configuration options
 * @returns Operation result with configuration data or error
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 * import { BusinessLogicResolver__factory } from '@typechain'
 * 
import {
    DeploymentProvider,
    OperationResult,
    createConfiguration,
    debug,
    error as logError,
    extractRevertReason,
    formatGasUsage,
    info,
    section,
    success,
    validateAddress,
    validateBytes32,
    waitForTransaction,
} from '@scripts/infrastructure'
 * import { EQUITY_CONFIG_ID } from '@scripts/domain/createEquityConfiguration'
 *
 * // Get BLR contract
 * const blr = BusinessLogicResolver__factory.connect(blrAddress, signer)
 *
 * // Define facet list (equity, bond, or any configuration type)
 * const facetNames = ['AccessControlFacet', 'KycFacet', 'EquityUSAFacet']
 *
 * // Create configuration
 * const result = await createConfiguration(blr, {
 *   configurationId: EQUITY_CONFIG_ID,
 *   facetNames,
 *   facetAddresses: {
 *     'AccessControlFacet': '0xabc...',
 *     'KycFacet': '0xdef...',
 *     'EquityUSAFacet': '0x123...'
 *   },
 *   useTimeTravel: false
 * })
 *
 * if (result.success) {
 *   console.log(`Config version: ${result.data.version}`)
 *   console.log(`Facets: ${result.data.facetKeys.length}`)
 * } else {
 *   console.error(result.error, result.message)
 * }
 * ```
 */
export async function createConfiguration(
    blrContract: Contract,
    options: {
        /** Configuration ID (any bytes32 value) */
        configurationId: string

        /** Facet names to include in configuration */
        facetNames: readonly string[]

        /** Map of facet contract names to deployed addresses */
        facetAddresses: Record<string, string>

        /** Whether to use TimeTravel variants */
        useTimeTravel?: boolean

        /** Optional gas limit override */
        gasLimit?: number
    }
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
    const {
        configurationId,
        facetNames,
        facetAddresses,
        useTimeTravel = false,
        gasLimit,
    } = options

    // Import utilities needed for operation
    const { resolveContractName } = await import('../utils/naming')
    const { getFacetDefinition } = await import('../registry')
    const { GAS_LIMIT } = await import('../constants')
    const { waitForTransaction } = await import('../utils/transaction')
    const { info } = await import('../utils/logging')
    const { ethers } = await import('ethers')
    const { ok, err } = await import('../types')

    // Validation
    if (facetNames.length === 0) {
        return err(
            'EMPTY_FACET_LIST',
            'At least one facet is required for configuration'
        )
    }

    try {
        const blrAddress = blrContract.address

        info('Creating BLR Configuration', {
            blrAddress,
            configurationId,
            facetCount: facetNames.length,
            useTimeTravel,
        })

        // 1. Resolve facet names and get addresses
        const facetKeys = facetNames
            .map((facetName) => {
                const contractName = resolveContractName(
                    facetName,
                    useTimeTravel
                )
                const address = facetAddresses[contractName]

                return {
                    facetName,
                    contractName,
                    key: ethers.utils.keccak256(
                        ethers.utils.toUtf8Bytes(facetName)
                    ),
                    address,
                }
            })
            .filter((facet) => {
                // Filter out facets without addresses
                if (!facet.address) {
                    info(
                        `Skipping ${facet.facetName} - not deployed or not available`,
                        {}
                    )
                    return false
                }

                // Filter out facets not in registry
                const definition = getFacetDefinition(facet.facetName)
                if (!definition) {
                    info(`Skipping ${facet.facetName} - not in registry`, {})
                    return false
                }

                return true
            })
            .map(({ facetName, key, address }) => ({
                facetName,
                key,
                address: address!,
            }))

        if (facetKeys.length === 0) {
            return err(
                'FACET_NOT_FOUND',
                'No valid facets found in provided addresses'
            )
        }

        info(`Resolved ${facetKeys.length} facets with addresses`, {})

        // 2. Get latest version from BLR
        const latestVersion = await blrContract.getLatestVersion()

        info('Retrieved latest version from BLR', {
            version: latestVersion.toNumber(),
        })

        // 3. Create FacetConfiguration array with facet keys and version
        const facetConfigurations = facetKeys.map((f) => ({
            id: f.key,
            version: latestVersion,
        }))

        // 4. Create configuration in BLR
        info('Creating configuration in BLR', {
            configurationId,
            facetCount: facetConfigurations.length,
        })

        const tx = await blrContract.createConfiguration(
            configurationId,
            facetConfigurations,
            {
                gasLimit:
                    gasLimit ||
                    GAS_LIMIT.businessLogicResolver.createConfiguration,
            }
        )

        info('Waiting for configuration creation transaction...')
        const receipt = await waitForTransaction(tx)

        // 5. Extract configuration version from event
        const event = receipt.events?.find(
            (e) => e.event === 'DiamondConfigurationCreated'
        )

        if (!event || !event.args) {
            return err(
                'EVENT_PARSE_FAILED',
                'DiamondConfigurationCreated event not found in transaction receipt'
            )
        }

        const configVersion = event.args.version?.toNumber()

        if (configVersion === undefined) {
            return err(
                'EVENT_PARSE_FAILED',
                'Configuration version not found in event'
            )
        }

        const { success: logSuccess } = await import('../utils/logging')
        logSuccess('Configuration created successfully', {
            configurationId,
            version: configVersion,
            facets: facetKeys.length,
            txHash: receipt.transactionHash,
        })

        return ok({
            configurationId,
            version: configVersion,
            facetKeys,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
        })
    } catch (error) {
        const { error: logError } = await import('../utils/logging')
        const errorMessage =
            error instanceof Error ? error.message : String(error)

        logError('Failed to create configuration', {
            error: errorMessage,
        })

        return err('TRANSACTION_FAILED', errorMessage, error)
    }
}

// Re-export Contract type for convenience
type Contract = import('ethers').Contract
