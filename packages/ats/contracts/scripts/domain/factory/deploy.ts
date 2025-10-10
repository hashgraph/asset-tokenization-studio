// SPDX-License-Identifier: Apache-2.0

/**
 * Factory deployment module.
 *
 * High-level module for deploying Factory contract with proxy and
 * initialization.
 *
 * @module domain/factory/deploy
 */

import {
    DeploymentProvider,
    DeployProxyResult,
    deployProxy,
    info,
    section,
    success,
    error as logError,
} from '@scripts/infrastructure'

/**
 * Options for deploying Factory.
 */
export interface DeployFactoryOptions {
    /** BLR address (required for Factory initialization) */
    blrAddress?: string

    /** ProxyAdmin address (optional, will deploy new one if not provided) */
    proxyAdminAddress?: string

    /** Whether to initialize after deployment */
    initialize?: boolean

    /** Network */
    network?: string
}

/**
 * Result of deploying Factory.
 */
export interface DeployFactoryResult {
    /** Whether deployment succeeded */
    success: boolean

    /** Proxy deployment result */
    proxyResult: DeployProxyResult

    /** Factory proxy address */
    factoryAddress: string

    /** Factory implementation address */
    implementationAddress: string

    /** ProxyAdmin address */
    proxyAdminAddress: string

    /** Whether Factory was initialized */
    initialized: boolean

    /** Error message (only if success=false) */
    error?: string
}

/**
 * Deploy Factory with proxy.
 *
 * This module handles the complete deployment of Factory contract
 * including proxy setup and optional initialization.
 *
 * @param provider - Deployment provider
 * @param options - Deployment options
 * @returns Deployment result
 *
 * @example
 * ```typescript
 * const result = await deployFactory(provider, {
 *   blrAddress: '0x123...',
 *   initialize: true
 * })
 * console.log(`Factory deployed at ${result.factoryAddress}`)
 * ```
 */
export async function deployFactory(
    provider: DeploymentProvider,
    options: DeployFactoryOptions = {}
): Promise<DeployFactoryResult> {
    const { proxyAdminAddress, network: _network } = options

    section('Deploying Factory')

    try {
        // Deploy Factory with proxy
        info('Deploying Factory implementation and proxy...')

        const proxyResult = await deployProxy(provider, {
            implementationContract: 'Factory',
            implementationArgs: [],
            proxyAdminAddress,
            initData: '0x', // Factory is stateless, no initialization needed
        })

        const factoryAddress = proxyResult.proxyAddress
        const implementationAddress = proxyResult.implementationAddress
        const adminAddress = proxyResult.proxyAdminAddress

        // Factory contract is stateless and doesn't require initialization
        // The BLR address is passed as a parameter when deploying tokens
        const initialized = false

        success('Factory deployment complete')
        info(`  Factory Proxy: ${factoryAddress}`)
        info(`  Implementation: ${implementationAddress}`)
        info(`  ProxyAdmin: ${adminAddress}`)

        return {
            success: true,
            proxyResult,
            factoryAddress,
            implementationAddress,
            proxyAdminAddress: adminAddress,
            initialized,
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        logError(`Factory deployment failed: ${errorMessage}`)

        throw new Error(`Factory deployment failed: ${errorMessage}`)
    }
}

/**
 * Deploy Factory with existing ProxyAdmin.
 *
 * Convenience function for deploying Factory using an already deployed
 * ProxyAdmin (e.g., shared with BLR).
 *
 * @param provider - Deployment provider
 * @param blrAddress - BLR address for initialization
 * @param proxyAdminAddress - Existing ProxyAdmin address
 * @returns Deployment result
 *
 * @example
 * ```typescript
 * const result = await deployFactoryWithProxyAdmin(
 *   provider,
 *   '0xBLR...',
 *   '0xProxyAdmin...'
 * )
 * ```
 */
export async function deployFactoryWithProxyAdmin(
    provider: DeploymentProvider,
    blrAddress: string,
    proxyAdminAddress: string
): Promise<DeployFactoryResult> {
    return deployFactory(provider, {
        blrAddress,
        proxyAdminAddress,
        initialize: true,
    })
}

/**
 * Get Factory deployment summary.
 *
 * @param result - Deployment result
 * @returns Summary object
 */
export function getFactoryDeploymentSummary(result: DeployFactoryResult): {
    factoryAddress: string
    implementationAddress: string
    proxyAdminAddress: string
    initialized: boolean
} {
    return {
        factoryAddress: result.factoryAddress,
        implementationAddress: result.implementationAddress,
        proxyAdminAddress: result.proxyAdminAddress,
        initialized: result.initialized,
    }
}
