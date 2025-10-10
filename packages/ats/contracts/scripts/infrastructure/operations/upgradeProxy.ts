// SPDX-License-Identifier: Apache-2.0

/**
 * Upgrade proxy operation.
 *
 * Atomic operation for upgrading transparent proxy implementations
 * with validation and verification.
 *
 * @module core/operations/upgradeProxy
 */

import { Overrides } from 'ethers'
import {
    DeploymentProvider,
    UpgradeProxyOptions,
    UpgradeProxyResult,
    debug,
    deployContract,
    error as logError,
    extractRevertReason,
    formatGasUsage,
    getProxyAdmin,
    getProxyImplementation,
    info,
    section,
    success,
    validateAddress,
    waitForTransaction,
    warn,
} from '@scripts/infrastructure'

/**
 * Upgrade a transparent proxy to a new implementation.
 *
 * This operation:
 * 1. Deploys new implementation (or uses existing address)
 * 2. Verifies ProxyAdmin ownership
 * 3. Upgrades proxy to new implementation
 * 4. Optionally calls initialization function
 *
 * @param provider - Deployment provider
 * @param options - Upgrade options
 * @returns Upgrade result with old and new implementations
 * @throws Error if upgrade fails
 *
 * @example
 * ```typescript
 * const result = await upgradeProxy(provider, {
 *   proxyAddress: '0x123...',
 *   newImplementationContract: 'BusinessLogicResolverV2',
 *   confirmations: 2
 * })
 * console.log(`Upgraded from ${result.oldImplementation} to ${result.newImplementation}`)
 * ```
 */
export async function upgradeProxy(
    provider: DeploymentProvider,
    options: UpgradeProxyOptions
): Promise<UpgradeProxyResult> {
    const {
        proxyAddress,
        newImplementationContract,
        newImplementationArgs = [],
        newImplementationAddress: existingNewImplAddress,
        proxyAdminAddress: existingProxyAdminAddress,
        initData,
        overrides = {},
        verify = true,
    } = options

    const deployOverrides: Overrides = { ...overrides }
    let oldImplementationAddress: string | undefined

    try {
        section(`Upgrading Proxy at ${proxyAddress}`)

        // Step 1: Validate proxy exists
        validateAddress(proxyAddress, 'proxy address')
        const ethProvider = provider.getProvider()
        const proxyCode = await ethProvider.getCode(proxyAddress)
        if (proxyCode === '0x') {
            throw new Error(
                `No contract found at proxy address ${proxyAddress}`
            )
        }

        // Step 2: Get current implementation
        oldImplementationAddress = await getProxyImplementation(
            provider,
            proxyAddress
        )
        info(`Current implementation: ${oldImplementationAddress}`)

        // Step 3: Get or verify ProxyAdmin
        let proxyAdminAddress: string

        if (existingProxyAdminAddress) {
            info(`Using provided ProxyAdmin: ${existingProxyAdminAddress}`)
            proxyAdminAddress = existingProxyAdminAddress
        } else {
            proxyAdminAddress = await getProxyAdmin(provider, proxyAddress)
            info(`ProxyAdmin from proxy: ${proxyAdminAddress}`)
        }

        validateAddress(proxyAdminAddress, 'ProxyAdmin address')

        // Verify ProxyAdmin has code
        const adminCode = await ethProvider.getCode(proxyAdminAddress)
        if (adminCode === '0x') {
            throw new Error(
                `No contract found at ProxyAdmin address ${proxyAdminAddress}`
            )
        }

        // Step 4: Deploy or get new implementation
        let newImplementationAddress: string

        if (existingNewImplAddress) {
            info(`Using existing implementation: ${existingNewImplAddress}`)
            newImplementationAddress = existingNewImplAddress

            if (verify) {
                const implCode = await ethProvider.getCode(
                    newImplementationAddress
                )
                if (implCode === '0x') {
                    throw new Error(
                        `No contract found at new implementation address ${newImplementationAddress}`
                    )
                }
            }
        } else {
            info(`Deploying new implementation: ${newImplementationContract}`)
            const implResult = await deployContract(provider, {
                contractName: newImplementationContract,
                args: newImplementationArgs,
                overrides: deployOverrides,
            })

            if (!implResult.success || !implResult.address) {
                throw new Error(
                    `New implementation deployment failed: ${implResult.error || 'Unknown error'}`
                )
            }

            newImplementationAddress = implResult.address
        }

        validateAddress(newImplementationAddress, 'new implementation address')

        // Check if already at this implementation
        if (
            oldImplementationAddress.toLowerCase() ===
            newImplementationAddress.toLowerCase()
        ) {
            warn('Proxy is already using this implementation')
            return {
                success: true,
                proxyAddress,
                oldImplementation: oldImplementationAddress,
                newImplementation: newImplementationAddress,
                upgraded: false,
            }
        }

        // Step 5: Perform upgrade
        const proxyAdminFactory = await provider.getFactory('ProxyAdmin')
        const proxyAdmin = proxyAdminFactory.attach(proxyAdminAddress)

        let upgradeTx

        if (initData && initData !== '0x') {
            info('Upgrading proxy with initialization...')
            debug(`Init data: ${initData}`)

            upgradeTx = await proxyAdmin.upgradeAndCall(
                proxyAddress,
                newImplementationAddress,
                initData,
                deployOverrides
            )
        } else {
            info('Upgrading proxy...')

            upgradeTx = await proxyAdmin.upgrade(
                proxyAddress,
                newImplementationAddress,
                deployOverrides
            )
        }

        info(`Upgrade transaction sent: ${upgradeTx.hash}`)

        const receipt = await waitForTransaction(upgradeTx, 1, 120000)

        const gasUsed = formatGasUsage(receipt, upgradeTx.gasLimit)
        debug(gasUsed)

        // Step 6: Verify upgrade
        if (verify) {
            const currentImplementation = await getProxyImplementation(
                provider,
                proxyAddress
            )

            if (
                currentImplementation.toLowerCase() !==
                newImplementationAddress.toLowerCase()
            ) {
                throw new Error(
                    `Upgrade verification failed: proxy still points to ${currentImplementation}`
                )
            }

            debug('Upgrade verified successfully')
        }

        success('Proxy upgraded successfully')
        info(`  Old implementation: ${oldImplementationAddress}`)
        info(`  New implementation: ${newImplementationAddress}`)

        return {
            success: true,
            proxyAddress,
            oldImplementation: oldImplementationAddress,
            newImplementation: newImplementationAddress,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toNumber(),
            upgraded: true,
        }
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Proxy upgrade failed: ${errorMessage}`)

        return {
            success: false,
            proxyAddress,
            oldImplementation: oldImplementationAddress || 'unknown',
            newImplementation: existingNewImplAddress || 'unknown',
            error: errorMessage,
            upgraded: false,
        }
    }
}

/**
 * Upgrade multiple proxies to new implementations.
 *
 * Useful for upgrading a suite of related contracts in sequence.
 *
 * @param provider - Deployment provider
 * @param upgrades - Array of upgrade options
 * @returns Map of proxy addresses to upgrade results
 *
 * @example
 * ```typescript
 * const results = await upgradeMultipleProxies(provider, [
 *   { proxyAddress: '0x123...', newImplementationContract: 'BLRV2' },
 *   { proxyAddress: '0x456...', newImplementationContract: 'FactoryV2' }
 * ])
 *
 * for (const [address, result] of results) {
 *   if (result.success && result.upgraded) {
 *     console.log(`${address} upgraded`)
 *   }
 * }
 * ```
 */
export async function upgradeMultipleProxies(
    provider: DeploymentProvider,
    upgrades: UpgradeProxyOptions[]
): Promise<Map<string, UpgradeProxyResult>> {
    const results = new Map<string, UpgradeProxyResult>()

    for (const upgradeOptions of upgrades) {
        const result = await upgradeProxy(provider, upgradeOptions)
        results.set(upgradeOptions.proxyAddress, result)

        // Continue on failure but log
        if (!result.success) {
            logError(
                `Upgrade failed for ${upgradeOptions.proxyAddress}, continuing with remaining upgrades`
            )
        }
    }

    return results
}

/**
 * Check if a proxy needs an upgrade by comparing implementations.
 *
 * @param provider - Deployment provider
 * @param proxyAddress - Address of the proxy
 * @param expectedImplementation - Expected implementation address
 * @returns true if proxy needs upgrade (current != expected)
 *
 * @example
 * ```typescript
 * const needsUpgrade = await proxyNeedsUpgrade(
 *   provider,
 *   '0x123...',
 *   '0xNewImpl...'
 * )
 * if (needsUpgrade) {
 *   await upgradeProxy(provider, { ... })
 * }
 * ```
 */
export async function proxyNeedsUpgrade(
    provider: DeploymentProvider,
    proxyAddress: string,
    expectedImplementation: string
): Promise<boolean> {
    try {
        validateAddress(proxyAddress, 'proxy address')
        validateAddress(
            expectedImplementation,
            'expected implementation address'
        )

        const currentImplementation = await getProxyImplementation(
            provider,
            proxyAddress
        )

        return (
            currentImplementation.toLowerCase() !==
            expectedImplementation.toLowerCase()
        )
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Error checking if proxy needs upgrade: ${errorMessage}`)
        // Return true to be safe - better to attempt upgrade than skip it
        return true
    }
}

/**
 * Prepare upgrade by deploying new implementation without upgrading proxy.
 *
 * Useful for testing new implementation before actual upgrade.
 *
 * @param provider - Deployment provider
 * @param implementationContract - New implementation contract name
 * @param implementationArgs - Constructor arguments
 * @param overrides - Transaction overrides
 * @returns Deployed implementation address
 *
 * @example
 * ```typescript
 * // Deploy and test new implementation
 * const newImplAddress = await prepareUpgrade(
 *   provider,
 *   'BusinessLogicResolverV2',
 *   []
 * )
 *
 * // ... test the new implementation ...
 *
 * // Then upgrade when ready
 * await upgradeProxy(provider, {
 *   proxyAddress: '0x123...',
 *   newImplementationAddress: newImplAddress
 * })
 * ```
 */
export async function prepareUpgrade(
    provider: DeploymentProvider,
    implementationContract: string,
    implementationArgs: unknown[] = [],
    overrides: Overrides = {}
): Promise<string> {
    try {
        info(`Preparing upgrade: deploying ${implementationContract}`)

        const result = await deployContract(provider, {
            contractName: implementationContract,
            args: implementationArgs,
            overrides,
        })

        if (!result.success || !result.address) {
            throw new Error(
                `Failed to prepare upgrade: ${result.error || 'Unknown error'}`
            )
        }

        success(`Implementation deployed at ${result.address}`)
        info('Ready for upgrade - use this address in upgradeProxy()')

        return result.address
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Failed to prepare upgrade: ${errorMessage}`)
        throw err
    }
}
