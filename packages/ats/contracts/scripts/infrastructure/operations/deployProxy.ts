// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy proxy operation.
 *
 * Atomic operation for deploying transparent upgradeable proxies with
 * implementation contracts and ProxyAdmin.
 *
 * @module core/operations/deployProxy
 */

import { Contract, Overrides } from 'ethers'
import {
    DEFAULT_TRANSACTION_TIMEOUT,
    DeployProxyOptions,
    DeployProxyResult,
    DeploymentProvider,
    debug,
    deployContract,
    error as logError,
    extractRevertReason,
    formatGasUsage,
    info,
    section,
    success,
    validateAddress,
    verifyDeployedContract,
    waitForTransaction,
} from '@scripts/infrastructure'

/**
 * Deploy a transparent upgradeable proxy with implementation and ProxyAdmin.
 *
 * This operation handles three deployments:
 * 1. Implementation contract (or uses existing address)
 * 2. ProxyAdmin contract (or uses existing address)
 * 3. TransparentUpgradeableProxy pointing to implementation
 *
 * @param provider - Deployment provider
 * @param options - Proxy deployment options
 * @returns Deployment result with all contract instances
 * @throws Error if any deployment fails
 *
 * @example
 * ```typescript
 * const result = await deployProxy(provider, {
 *   implementationContract: 'BusinessLogicResolver',
 *   implementationArgs: [],
 *   initData: '0x',
 *   confirmations: 2
 * })
 * console.log(`Proxy: ${result.proxyAddress}`)
 * console.log(`Implementation: ${result.implementationAddress}`)
 * console.log(`ProxyAdmin: ${result.proxyAdminAddress}`)
 * ```
 */
export async function deployProxy(
    provider: DeploymentProvider,
    options: DeployProxyOptions
): Promise<DeployProxyResult> {
    const {
        implementationContract,
        implementationArgs = [],
        implementationAddress: existingImplAddress,
        proxyAdminAddress: existingProxyAdminAddress,
        initData = '0x',
        network: _network,
        overrides = {},
        verify = false,
    } = options

    const deployOverrides: Overrides = { ...overrides }
    const receipts: DeployProxyResult['receipts'] = {}

    try {
        section(`Deploying Proxy for ${implementationContract}`)

        // Step 1: Deploy or verify implementation
        let implementationAddress: string
        let implementation: Contract

        if (existingImplAddress) {
            info(`Using existing implementation at ${existingImplAddress}`)
            implementationAddress = existingImplAddress

            if (verify) {
                const exists = await verifyDeployedContract(
                    provider,
                    implementationAddress,
                    implementationContract
                )
                if (!exists) {
                    throw new Error(
                        `No contract found at implementation address ${implementationAddress}`
                    )
                }
            }

            const factory = await provider.getFactory(implementationContract)
            implementation = factory.attach(implementationAddress)
        } else {
            info(`Deploying implementation: ${implementationContract}`)
            const implResult = await deployContract(provider, {
                contractName: implementationContract,
                args: implementationArgs,
                overrides: deployOverrides,
            })

            if (
                !implResult.success ||
                !implResult.contract ||
                !implResult.address
            ) {
                throw new Error(
                    `Implementation deployment failed: ${implResult.error || 'Unknown error'}`
                )
            }

            implementation = implResult.contract
            implementationAddress = implResult.address

            if (implResult.transactionHash) {
                const ethProvider = provider.getProvider()
                receipts.implementation =
                    await ethProvider.getTransactionReceipt(
                        implResult.transactionHash
                    )
            }
        }

        validateAddress(implementationAddress, 'implementation address')

        // Step 2: Deploy or verify ProxyAdmin
        let proxyAdminAddress: string
        let proxyAdmin: Contract

        if (existingProxyAdminAddress) {
            info(`Using existing ProxyAdmin at ${existingProxyAdminAddress}`)
            proxyAdminAddress = existingProxyAdminAddress

            if (verify) {
                const exists = await verifyDeployedContract(
                    provider,
                    proxyAdminAddress,
                    'ProxyAdmin'
                )
                if (!exists) {
                    throw new Error(
                        `No contract found at ProxyAdmin address ${proxyAdminAddress}`
                    )
                }
            }

            const factory = await provider.getFactory('ProxyAdmin')
            proxyAdmin = factory.attach(proxyAdminAddress)
        } else {
            info('Deploying ProxyAdmin')
            const adminResult = await deployContract(provider, {
                contractName: 'ProxyAdmin',
                overrides: deployOverrides,
            })

            if (
                !adminResult.success ||
                !adminResult.contract ||
                !adminResult.address
            ) {
                throw new Error(
                    `ProxyAdmin deployment failed: ${adminResult.error || 'Unknown error'}`
                )
            }

            proxyAdmin = adminResult.contract
            proxyAdminAddress = adminResult.address

            if (adminResult.transactionHash) {
                const ethProvider = provider.getProvider()
                receipts.proxyAdmin = await ethProvider.getTransactionReceipt(
                    adminResult.transactionHash
                )
            }
        }

        validateAddress(proxyAdminAddress, 'ProxyAdmin address')

        // Step 3: Deploy TransparentUpgradeableProxy
        info('Deploying TransparentUpgradeableProxy')
        debug(`Implementation: ${implementationAddress}`)
        debug(`ProxyAdmin: ${proxyAdminAddress}`)
        debug(`Init data: ${initData}`)

        const proxy = await provider.deployProxy(
            implementationAddress,
            proxyAdminAddress,
            initData,
            deployOverrides
        )

        info(`Proxy transaction sent: ${proxy.deployTransaction.hash}`)

        const proxyReceipt = await waitForTransaction(
            proxy.deployTransaction,
            1,
            DEFAULT_TRANSACTION_TIMEOUT
        )

        receipts.proxy = proxyReceipt
        validateAddress(proxy.address, 'proxy address')

        const gasUsed = formatGasUsage(
            proxyReceipt,
            proxy.deployTransaction.gasLimit
        )
        debug(gasUsed)

        success(`Proxy deployment complete`)
        info(`  Proxy:          ${proxy.address}`)
        info(`  Implementation: ${implementationAddress}`)
        info(`  ProxyAdmin:     ${proxyAdminAddress}`)

        return {
            implementation,
            implementationAddress,
            proxy,
            proxyAddress: proxy.address,
            proxyAdmin,
            proxyAdminAddress,
            receipts,
        }
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Proxy deployment failed: ${errorMessage}`)
        throw err
    }
}

/**
 * Deploy multiple proxies with shared ProxyAdmin.
 *
 * Deploys one ProxyAdmin and multiple proxies, reusing the ProxyAdmin
 * for all proxies to save gas and simplify management.
 *
 * @param provider - Deployment provider
 * @param proxies - Array of proxy deployment options (without proxyAdminAddress)
 * @param sharedProxyAdminAddress - Optional existing ProxyAdmin to reuse
 * @returns Array of deployment results
 *
 * @example
 * ```typescript
 * const results = await deployMultipleProxies(provider, [
 *   { implementationContract: 'BusinessLogicResolver', initData: '0x' },
 *   { implementationContract: 'Factory', initData: '0x' }
 * ])
 * ```
 */
export async function deployMultipleProxies(
    provider: DeploymentProvider,
    proxies: Omit<DeployProxyOptions, 'proxyAdminAddress'>[],
    sharedProxyAdminAddress?: string
): Promise<DeployProxyResult[]> {
    const results: DeployProxyResult[] = []

    // Deploy or get shared ProxyAdmin
    let proxyAdminAddress: string

    if (sharedProxyAdminAddress) {
        info(`Using shared ProxyAdmin at ${sharedProxyAdminAddress}`)
        proxyAdminAddress = sharedProxyAdminAddress
    } else {
        info('Deploying shared ProxyAdmin for all proxies')
        const adminResult = await deployContract(provider, {
            contractName: 'ProxyAdmin',
        })

        if (!adminResult.success || !adminResult.address) {
            throw new Error(
                `Shared ProxyAdmin deployment failed: ${adminResult.error || 'Unknown error'}`
            )
        }

        proxyAdminAddress = adminResult.address
        success(`Shared ProxyAdmin deployed at ${proxyAdminAddress}`)
    }

    // Deploy all proxies with shared ProxyAdmin
    for (const proxyOptions of proxies) {
        const result = await deployProxy(provider, {
            ...proxyOptions,
            proxyAdminAddress,
        })
        results.push(result)
    }

    return results
}

/**
 * Get the implementation address from a deployed proxy.
 *
 * @param provider - Deployment provider
 * @param proxyAddress - Address of the proxy
 * @returns Implementation address
 *
 * @example
 * ```typescript
 * const implAddress = await getProxyImplementation(provider, '0x123...')
 * console.log(`Current implementation: ${implAddress}`)
 * ```
 */
export async function getProxyImplementation(
    provider: DeploymentProvider,
    proxyAddress: string
): Promise<string> {
    try {
        validateAddress(proxyAddress, 'proxy address')

        const ethProvider = provider.getProvider()

        // Read implementation from EIP-1967 storage slot
        // keccak256("eip1967.proxy.implementation") - 1
        const implSlot =
            '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'

        const implBytes = await ethProvider.getStorageAt(proxyAddress, implSlot)

        // Convert bytes32 to address (take last 20 bytes)
        const implementationAddress = '0x' + implBytes.slice(-40)

        validateAddress(
            implementationAddress,
            'implementation address from proxy'
        )

        return implementationAddress
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(
            `Failed to get implementation from proxy ${proxyAddress}: ${errorMessage}`
        )
        throw err
    }
}

/**
 * Get the ProxyAdmin address from a deployed proxy.
 *
 * @param provider - Deployment provider
 * @param proxyAddress - Address of the proxy
 * @returns ProxyAdmin address
 *
 * @example
 * ```typescript
 * const adminAddress = await getProxyAdmin(provider, '0x123...')
 * console.log(`ProxyAdmin: ${adminAddress}`)
 * ```
 */
export async function getProxyAdmin(
    provider: DeploymentProvider,
    proxyAddress: string
): Promise<string> {
    try {
        validateAddress(proxyAddress, 'proxy address')

        const ethProvider = provider.getProvider()

        // Read admin from EIP-1967 storage slot
        // keccak256("eip1967.proxy.admin") - 1
        const adminSlot =
            '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'

        const adminBytes = await ethProvider.getStorageAt(
            proxyAddress,
            adminSlot
        )

        // Convert bytes32 to address (take last 20 bytes)
        const proxyAdminAddress = '0x' + adminBytes.slice(-40)

        validateAddress(proxyAdminAddress, 'ProxyAdmin address from proxy')

        return proxyAdminAddress
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(
            `Failed to get ProxyAdmin from proxy ${proxyAddress}: ${errorMessage}`
        )
        throw err
    }
}
