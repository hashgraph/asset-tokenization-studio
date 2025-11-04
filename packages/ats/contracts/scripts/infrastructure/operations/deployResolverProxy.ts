// SPDX-License-Identifier: Apache-2.0

/**
 * ResolverProxy deployment operation.
 *
 * Deploys Diamond pattern proxies using BusinessLogicResolver for facet routing.
 * Provides standardized deployment workflow with logging, error handling, and
 * optional Hedera Contract ID extraction.
 *
 * @module infrastructure/operations/deployResolverProxy
 */

import { Contract, ContractReceipt, Overrides, Signer } from 'ethers'
import {
    DEFAULT_TRANSACTION_TIMEOUT,
    debug,
    error as logError,
    formatGasUsage,
    info,
    section,
    success,
    validateAddress,
    waitForTransaction,
} from '@scripts/infrastructure'

/**
 * RBAC configuration for ResolverProxy.
 */
export interface ResolverProxyRbac {
    /** Role identifier (bytes32) */
    role: string
    /** Array of addresses to grant this role */
    members: string[]
}

/**
 * Options for deploying a ResolverProxy.
 */
export interface DeployResolverProxyOptions {
    /** BusinessLogicResolver address */
    blrAddress: string

    /** Configuration ID in BLR */
    configurationId: string

    /** Configuration version */
    version: number

    /** RBAC configuration (optional, defaults to empty array) */
    rbac?: ResolverProxyRbac[]

    /** Network */
    network?: string

    /** Transaction overrides */
    overrides?: Overrides

    /** Number of confirmations to wait for */
    confirmations?: number
}

/**
 * Result of ResolverProxy deployment.
 */
export interface DeployResolverProxyResult {
    /** Whether deployment succeeded */
    success: boolean

    /** Deployed ResolverProxy contract instance */
    contract?: Contract

    /** ResolverProxy address */
    proxyAddress?: string

    /** Hedera Contract ID (if Hedera network) */
    contractId?: string

    /** Configuration ID used */
    configurationId?: string

    /** Version used */
    version?: number

    /** Deployment transaction receipt */
    receipt?: ContractReceipt

    /** Error type if failed */
    error?: string

    /** Detailed error message */
    message?: string
}

/**
 * Deploy a ResolverProxy (Diamond pattern proxy).
 *
 * Creates a new ResolverProxy instance that uses the BusinessLogicResolver
 * for facet routing. This is the standard deployment method for Diamond
 * pattern contracts in the ATS ecosystem.
 *
 * @param provider - Deployment provider (HardhatProvider or StandaloneProvider)
 * @param options - Deployment options
 * @returns Deployment result with proxy address and metadata
 *
 * @example
 * ```typescript
 * import { deployResolverProxy } from '@scripts/infrastructure'
 *
 * // Deploy ResolverProxy for FactorySuite
 * const result = await deployResolverProxy(provider, {
 *     blrAddress: '0x123...',
 *     configurationId: '0x7530', // FactorySuite config ID
 *     version: 1,
 *     rbac: [], // Roles configured separately
 * })
 *
 * if (result.success) {
 *     console.log(`ResolverProxy deployed at: ${result.proxyAddress}`)
 * }
 * ```
 */
export async function deployResolverProxy(
    signer: Signer,
    options: DeployResolverProxyOptions
): Promise<DeployResolverProxyResult> {
    const {
        blrAddress,
        configurationId,
        version,
        rbac = [],
        network: _network,
        overrides = {},
        confirmations = 1,
    } = options

    section('Deploying ResolverProxy')

    try {
        info(`BLR Address: ${blrAddress}`)
        info(`Config ID: ${configurationId}`)
        info(`Version: ${version}`)
        info(`RBAC Rules: ${rbac.length}`)

        validateAddress(blrAddress, 'BLR address')

        // Get ResolverProxy factory from TypeChain
        const { ResolverProxy__factory } = await import('@contract-types')
        const ResolverProxyFactory = new ResolverProxy__factory(signer)

        // Deploy ResolverProxy
        info('Deploying ResolverProxy contract...')
        const resolverProxy = await ResolverProxyFactory.deploy(
            blrAddress,
            configurationId,
            version,
            rbac,
            overrides
        )

        info(`Transaction sent: ${resolverProxy.deployTransaction.hash}`)

        // Wait for deployment with proper timeout and confirmations
        const receipt = await waitForTransaction(
            resolverProxy.deployTransaction,
            confirmations,
            DEFAULT_TRANSACTION_TIMEOUT
        )

        const proxyAddress = resolverProxy.address

        validateAddress(proxyAddress, 'ResolverProxy address')

        const gasUsed = formatGasUsage(
            receipt,
            resolverProxy.deployTransaction.gasLimit
        )
        debug(gasUsed)

        success('ResolverProxy deployment complete')
        info(`  ResolverProxy: ${proxyAddress}`)

        return {
            success: true,
            contract: resolverProxy,
            proxyAddress,
            configurationId,
            version,
            receipt,
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        logError(`ResolverProxy deployment failed: ${errorMessage}`)

        throw new Error(`ResolverProxy deployment failed: ${errorMessage}`)
    }
}
