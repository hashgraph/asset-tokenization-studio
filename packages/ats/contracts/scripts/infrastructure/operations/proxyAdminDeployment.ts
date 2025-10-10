import {
    DeploymentProvider,
    DeploymentResult,
    deployContract,
    error as logError,
    extractRevertReason,
    getProxyAdmin,
    info,
    section,
    success,
    validateAddress,
} from '@scripts/infrastructure'
// SPDX-License-Identifier: Apache-2.0

/**
 * ProxyAdmin deployment module.
 *
 * High-level operation for deploying ProxyAdmin and managing proxy ownership.
 *
 * @module core/operations/proxyAdminDeployment
 */

/**
 * Options for deploying ProxyAdmin.
 */
export interface DeployProxyAdminOptions {
    /** Network */
    network?: string
}

/**
 * Result of deploying ProxyAdmin.
 */
export interface DeployProxyAdminResult {
    /** Whether deployment succeeded */
    success: boolean

    /** Deployment result */
    deploymentResult: DeploymentResult

    /** ProxyAdmin address */
    proxyAdminAddress: string

    /** Error message (only if success=false) */
    error?: string
}

/**
 * Deploy ProxyAdmin contract.
 *
 * This module handles the deployment of a ProxyAdmin that can be shared
 * across multiple transparent proxies.
 *
 * @param provider - Deployment provider
 * @param options - Deployment options
 * @returns Deployment result
 *
 * @example
 * ```typescript
 * const result = await deployProxyAdmin(provider)
 * console.log(`ProxyAdmin deployed at ${result.proxyAdminAddress}`)
 * ```
 */
export async function deployProxyAdmin(
    provider: DeploymentProvider,
    options: DeployProxyAdminOptions = {}
): Promise<DeployProxyAdminResult> {
    const { network: _network } = options

    section('Deploying ProxyAdmin')

    try {
        info('Deploying ProxyAdmin...')

        const result = await deployContract(provider, {
            contractName: 'ProxyAdmin',
            confirmations: 1,
        })

        if (!result.success || !result.address) {
            throw new Error(result.error || 'ProxyAdmin deployment failed')
        }

        success('ProxyAdmin deployment complete')
        info(`  ProxyAdmin: ${result.address}`)

        return {
            success: true,
            deploymentResult: result,
            proxyAdminAddress: result.address,
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        logError(`ProxyAdmin deployment failed: ${errorMessage}`)

        throw new Error(`ProxyAdmin deployment failed: ${errorMessage}`)
    }
}

/**
 * Options for transferring proxy admin ownership.
 */
export interface TransferProxyAdminOptions {
    /** ProxyAdmin address */
    proxyAdminAddress: string

    /** Proxy address whose admin to transfer */
    proxyAddress: string

    /** New admin address */
    newAdmin: string
}

/**
 * Transfer proxy admin ownership.
 *
 * Changes the admin of a proxy to a new address. This is useful when
 * consolidating multiple proxies under a single ProxyAdmin.
 *
 * @param provider - Deployment provider
 * @param options - Transfer options
 * @returns true if transfer succeeded
 *
 * @example
 * ```typescript
 * await transferProxyAdmin(provider, {
 *   proxyAdminAddress: '0x123...',
 *   proxyAddress: '0x456...',
 *   newAdmin: '0x789...'
 * })
 * ```
 */
export async function transferProxyAdmin(
    provider: DeploymentProvider,
    options: TransferProxyAdminOptions
): Promise<boolean> {
    const { proxyAdminAddress, proxyAddress, newAdmin } = options

    try {
        info('Transferring proxy admin...')

        validateAddress(proxyAdminAddress, 'ProxyAdmin address')
        validateAddress(proxyAddress, 'proxy address')
        validateAddress(newAdmin, 'new admin address')

        const proxyAdminFactory = await provider.getFactory('ProxyAdmin')
        const proxyAdmin = proxyAdminFactory.attach(proxyAdminAddress)

        const tx = await proxyAdmin.changeProxyAdmin(proxyAddress, newAdmin)
        await tx.wait()

        success('Proxy admin transferred')
        info(`  Proxy: ${proxyAddress}`)
        info(`  New Admin: ${newAdmin}`)

        return true
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Transfer proxy admin failed: ${errorMessage}`)
        return false
    }
}

/**
 * Get the owner of a ProxyAdmin.
 *
 * @param provider - Deployment provider
 * @param proxyAdminAddress - ProxyAdmin address
 * @returns Owner address
 *
 * @example
 * ```typescript
 * const owner = await getProxyAdminOwner(provider, '0x123...')
 * console.log(`ProxyAdmin owner: ${owner}`)
 * ```
 */
export async function getProxyAdminOwner(
    provider: DeploymentProvider,
    proxyAdminAddress: string
): Promise<string> {
    try {
        validateAddress(proxyAdminAddress, 'ProxyAdmin address')

        const proxyAdminFactory = await provider.getFactory('ProxyAdmin')
        const proxyAdmin = proxyAdminFactory.attach(proxyAdminAddress)

        const owner = await proxyAdmin.owner()
        return owner
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        throw new Error(`Failed to get ProxyAdmin owner: ${errorMessage}`)
    }
}

/**
 * Transfer ownership of a ProxyAdmin.
 *
 * @param provider - Deployment provider
 * @param proxyAdminAddress - ProxyAdmin address
 * @param newOwner - New owner address
 * @returns true if transfer succeeded
 *
 * @example
 * ```typescript
 * await transferProxyAdminOwnership(provider, '0x123...', '0x456...')
 * ```
 */
export async function transferProxyAdminOwnership(
    provider: DeploymentProvider,
    proxyAdminAddress: string,
    newOwner: string
): Promise<boolean> {
    try {
        info('Transferring ProxyAdmin ownership...')

        validateAddress(proxyAdminAddress, 'ProxyAdmin address')
        validateAddress(newOwner, 'new owner address')

        const proxyAdminFactory = await provider.getFactory('ProxyAdmin')
        const proxyAdmin = proxyAdminFactory.attach(proxyAdminAddress)

        const tx = await proxyAdmin.transferOwnership(newOwner)
        await tx.wait()

        success('ProxyAdmin ownership transferred')
        info(`  New Owner: ${newOwner}`)

        return true
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Transfer ownership failed: ${errorMessage}`)
        return false
    }
}

/**
 * Verify ProxyAdmin controls a proxy.
 *
 * @param provider - Deployment provider
 * @param proxyAdminAddress - ProxyAdmin address
 * @param proxyAddress - Proxy address
 * @returns true if ProxyAdmin controls the proxy
 *
 * @example
 * ```typescript
 * const controls = await verifyProxyAdminControls(
 *   provider,
 *   '0xProxyAdmin...',
 *   '0xProxy...'
 * )
 * ```
 */
export async function verifyProxyAdminControls(
    provider: DeploymentProvider,
    proxyAdminAddress: string,
    proxyAddress: string
): Promise<boolean> {
    try {
        validateAddress(proxyAdminAddress, 'ProxyAdmin address')
        validateAddress(proxyAddress, 'proxy address')

        const actualAdmin = await getProxyAdmin(provider, proxyAddress)

        return actualAdmin.toLowerCase() === proxyAdminAddress.toLowerCase()
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Verification failed: ${errorMessage}`)
        return false
    }
}

/**
 * Get deployment summary for ProxyAdmin.
 *
 * @param result - Deployment result
 * @returns Summary object
 */
export function getProxyAdminDeploymentSummary(
    result: DeployProxyAdminResult
): {
    proxyAdminAddress: string
    gasUsed: number | undefined
} {
    return {
        proxyAdminAddress: result.proxyAdminAddress,
        gasUsed: result.deploymentResult.gasUsed,
    }
}
