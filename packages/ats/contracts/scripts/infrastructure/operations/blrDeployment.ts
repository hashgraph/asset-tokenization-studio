import {
    CreateBlrConfigurationResult,
    DeployProxyResult,
    DeploymentProvider,
    FacetConfiguration,
    RegisterFacetsResult,
    createBlrConfiguration,
    deployProxy,
    error as logError,
    info,
    registerFacets,
    section,
    success,
} from '@scripts/infrastructure'
// SPDX-License-Identifier: Apache-2.0

/**
 * BLR deployment module.
 *
 * High-level operation for deploying and configuring BusinessLogicResolver
 * with proxy, facets, and configurations.
 *
 * @module core/operations/blrDeployment
 */

/**
 * Options for deploying BLR.
 */
export interface DeployBlrOptions {
    /** ProxyAdmin address (optional, will deploy new one if not provided) */
    proxyAdminAddress?: string

    /** Whether to initialize after deployment */
    initialize?: boolean

    /** Network */
    network?: string
}

/**
 * Result of deploying BLR.
 */
export interface DeployBlrResult {
    /** Whether deployment succeeded */
    success: boolean

    /** Proxy deployment result */
    proxyResult: DeployProxyResult

    /** BLR proxy address */
    blrAddress: string

    /** BLR implementation address */
    implementationAddress: string

    /** ProxyAdmin address */
    proxyAdminAddress: string

    /** Whether BLR was initialized */
    initialized: boolean

    /** Error message (only if success=false) */
    error?: string
}

/**
 * Deploy BLR with proxy.
 *
 * This module handles the complete deployment of BusinessLogicResolver
 * including proxy setup and optional initialization.
 *
 * @param provider - Deployment provider
 * @param options - Deployment options
 * @returns Deployment result
 *
 * @example
 * ```typescript
 * const result = await deployBlr(provider, {
 *   initialize: true
 * })
 * console.log(`BLR deployed at ${result.blrAddress}`)
 * ```
 */
export async function deployBlr(
    provider: DeploymentProvider,
    options: DeployBlrOptions = {}
): Promise<DeployBlrResult> {
    const { proxyAdminAddress, initialize = true, network: _network } = options

    section('Deploying BusinessLogicResolver')

    try {
        // Deploy BLR with proxy
        info('Deploying BLR implementation and proxy...')

        const proxyResult = await deployProxy(provider, {
            implementationContract: 'BusinessLogicResolver',
            implementationArgs: [],
            proxyAdminAddress,
            initData: '0x', // Will initialize separately if requested
        })

        const blrAddress = proxyResult.proxyAddress
        const implementationAddress = proxyResult.implementationAddress
        const adminAddress = proxyResult.proxyAdminAddress

        let initialized = false

        // Initialize if requested
        if (initialize) {
            info('Initializing BLR...')

            try {
                const blrFactory = await provider.getFactory(
                    'BusinessLogicResolver'
                )
                const blr = blrFactory.attach(blrAddress)

                const initTx = await blr.initialize_BusinessLogicResolver()
                await initTx.wait()

                initialized = true
                success('BLR initialized')
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : String(err)
                logError(`BLR initialization failed: ${errorMsg}`)
                // Don't fail deployment if initialization fails
            }
        }

        success('BLR deployment complete')
        info(`  BLR Proxy: ${blrAddress}`)
        info(`  Implementation: ${implementationAddress}`)
        info(`  ProxyAdmin: ${adminAddress}`)

        return {
            success: true,
            proxyResult,
            blrAddress,
            implementationAddress,
            proxyAdminAddress: adminAddress,
            initialized,
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        logError(`BLR deployment failed: ${errorMessage}`)

        throw new Error(`BLR deployment failed: ${errorMessage}`)
    }
}

/**
 * Options for deploying and configuring BLR with facets.
 */
export interface DeployBlrWithFacetsOptions extends DeployBlrOptions {
    /** Deployed facets to register (facet name -> address) */
    facets: Record<string, string>

    /** Configurations to create (optional) */
    configurations?: {
        configurationId: string
        facets: FacetConfiguration[]
    }[]
}

/**
 * Result of deploying BLR with facets.
 */
export interface DeployBlrWithFacetsResult extends DeployBlrResult {
    /** Facet registration result */
    registrationResult?: RegisterFacetsResult

    /** Configuration results */
    configurationResults?: CreateBlrConfigurationResult[]
}

/**
 * Deploy BLR and register facets.
 *
 * This is a complete workflow that deploys BLR, initializes it, and
 * registers facets in one operation.
 *
 * @param provider - Deployment provider
 * @param options - Deployment options
 * @returns Deployment result
 *
 * @example
 * ```typescript
 * const result = await deployBlrWithFacets(provider, {
 *   facets: {
 *     'AccessControlFacet': '0x123...',
 *     'KycFacet': '0x456...',
 *     'PauseFacet': '0x789...'
 *   },
 *   initialize: true
 * })
 * ```
 */
export async function deployBlrWithFacets(
    provider: DeploymentProvider,
    options: DeployBlrWithFacetsOptions
): Promise<DeployBlrWithFacetsResult> {
    const { facets, configurations, ...blrOptions } = options

    section('Deploying BLR with Facets')

    try {
        // Deploy BLR
        const blrResult = await deployBlr(provider, blrOptions)

        if (!blrResult.success) {
            throw new Error('BLR deployment failed')
        }

        let registrationResult: RegisterFacetsResult | undefined

        // Register facets if provided
        if (Object.keys(facets).length > 0) {
            info('\nRegistering facets...')

            registrationResult = await registerFacets(provider, {
                blrAddress: blrResult.blrAddress,
                facets,
            })

            if (!registrationResult.success) {
                logError('Facet registration failed')
            } else {
                success(
                    `Registered ${registrationResult.registered.length} facets`
                )
            }
        }

        const configurationResults: CreateBlrConfigurationResult[] = []

        // Create configurations if provided
        if (configurations && configurations.length > 0) {
            info('\nCreating configurations...')

            for (const config of configurations) {
                const configResult = await createBlrConfiguration(provider, {
                    blrAddress: blrResult.blrAddress,
                    configurationId: config.configurationId,
                    facets: config.facets,
                })

                configurationResults.push(configResult)

                if (configResult.success) {
                    success(`Created configuration ${config.configurationId}`)
                } else {
                    logError(
                        `Failed to create configuration ${config.configurationId}`
                    )
                }
            }
        }

        return {
            ...blrResult,
            registrationResult,
            configurationResults:
                configurationResults.length > 0
                    ? configurationResults
                    : undefined,
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        throw new Error(`BLR with facets deployment failed: ${errorMessage}`)
    }
}

/**
 * Get BLR deployment summary.
 *
 * @param result - Deployment result
 * @returns Summary object
 */
export function getBlrDeploymentSummary(result: DeployBlrWithFacetsResult): {
    blrAddress: string
    implementationAddress: string
    proxyAdminAddress: string
    initialized: boolean
    facetsRegistered: number
    facetsFailed: number
    configurationsCreated: number
} {
    return {
        blrAddress: result.blrAddress,
        implementationAddress: result.implementationAddress,
        proxyAdminAddress: result.proxyAdminAddress,
        initialized: result.initialized,
        facetsRegistered: result.registrationResult?.registered.length || 0,
        facetsFailed: result.registrationResult?.failed.length || 0,
        configurationsCreated: result.configurationResults?.length || 0,
    }
}
