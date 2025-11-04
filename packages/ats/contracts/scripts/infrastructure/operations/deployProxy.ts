// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy proxy operation.
 *
 * Atomic operation for deploying transparent upgradeable proxies with
 * implementation contracts and ProxyAdmin using TypeChain.
 *
 * @module core/operations/deployProxy
 */

import {
    Contract,
    ContractFactory,
    ContractReceipt,
    Overrides,
    Signer,
    providers,
} from 'ethers'
import {
    ProxyAdmin,
    ProxyAdmin__factory,
    TransparentUpgradeableProxy,
    TransparentUpgradeableProxy__factory,
} from '@contract-types'
import {
    DEFAULT_TRANSACTION_TIMEOUT,
    debug,
    deployContract,
    deployProxyAdmin,
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
 * Options for deploying a transparent upgradeable proxy.
 */
export interface DeployProxyOptions {
    /** Implementation contract factory (from TypeChain or ethers) */
    implementationFactory: ContractFactory
    /** Constructor arguments for implementation */
    implementationArgs?: unknown[]
    /** Optional existing implementation address (skips deployment) */
    implementationAddress?: string
    /** Optional existing ProxyAdmin address (skips deployment) */
    proxyAdminAddress?: string
    /** Initialization data to pass to proxy */
    initData?: string
    /** Transaction overrides */
    overrides?: Overrides
    /** Verify existing contracts have code */
    verify?: boolean
}

/**
 * Result of proxy deployment.
 */
export interface DeployProxyResult {
    /** Implementation contract instance */
    implementation: Contract
    /** Implementation address */
    implementationAddress: string
    /** Proxy contract instance (typed as TransparentUpgradeableProxy) */
    proxy: TransparentUpgradeableProxy
    /** Proxy address */
    proxyAddress: string
    /** ProxyAdmin contract instance (typed) */
    proxyAdmin: ProxyAdmin
    /** ProxyAdmin address */
    proxyAdminAddress: string
    /** Transaction receipts */
    receipts: {
        implementation?: ContractReceipt
        proxyAdmin?: ContractReceipt
        proxy?: ContractReceipt
    }
}

/**
 * Deploy a transparent upgradeable proxy with implementation and ProxyAdmin.
 *
 * This operation handles three deployments:
 * 1. Implementation contract (or uses existing address)
 * 2. ProxyAdmin contract (or uses existing address)
 * 3. TransparentUpgradeableProxy pointing to implementation
 *
 * @param signer - Ethers.js signer
 * @param options - Proxy deployment options
 * @returns Deployment result with all contract instances
 * @throws Error if any deployment fails
 *
 * @example
 * ```typescript
 * import { ethers } from 'hardhat'
 * import { BusinessLogicResolver__factory } from '@contract-types'
 *
 * const signer = (await ethers.getSigners())[0]
 * const factory = BusinessLogicResolver__factory.connect(signer)
 *
 * const result = await deployProxy(signer, {
 *   implementationFactory: factory,
 *   implementationArgs: [],
 *   initData: '0x',
 * })
 *
 * console.log(`Proxy: ${result.proxyAddress}`)
 * console.log(`Implementation: ${result.implementationAddress}`)
 * console.log(`ProxyAdmin: ${result.proxyAdminAddress}`)
 * ```
 */
export async function deployProxy(
    signer: Signer,
    options: DeployProxyOptions
): Promise<DeployProxyResult> {
    const {
        implementationFactory,
        implementationArgs = [],
        implementationAddress: existingImplAddress,
        proxyAdminAddress: existingProxyAdminAddress,
        initData = '0x',
        overrides = {},
        verify = false,
    } = options

    const deployOverrides: Overrides = { ...overrides }
    const receipts: DeployProxyResult['receipts'] = {}

    // Get contract name from factory for logging
    const implementationContract =
        implementationFactory.constructor.name.replace('__factory', '') ||
        'Contract'

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
                    signer.provider!,
                    implementationAddress,
                    implementationContract
                )
                if (!exists) {
                    throw new Error(
                        `No contract found at implementation address ${implementationAddress}`
                    )
                }
            }

            implementation = implementationFactory.attach(implementationAddress)
        } else {
            info(`Deploying implementation: ${implementationContract}`)
            const implResult = await deployContract(implementationFactory, {
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
                receipts.implementation =
                    await signer.provider!.getTransactionReceipt(
                        implResult.transactionHash
                    )
            }
        }

        validateAddress(implementationAddress, 'implementation address')

        // Step 2: Deploy or verify ProxyAdmin
        let proxyAdminAddress: string
        let proxyAdmin: ProxyAdmin

        if (existingProxyAdminAddress) {
            info(`Using existing ProxyAdmin at ${existingProxyAdminAddress}`)
            proxyAdminAddress = existingProxyAdminAddress

            if (verify) {
                const exists = await verifyDeployedContract(
                    signer.provider!,
                    proxyAdminAddress,
                    'ProxyAdmin'
                )
                if (!exists) {
                    throw new Error(
                        `No contract found at ProxyAdmin address ${proxyAdminAddress}`
                    )
                }
            }

            proxyAdmin = ProxyAdmin__factory.connect(proxyAdminAddress, signer)
        } else {
            info('Deploying ProxyAdmin')
            proxyAdmin = await deployProxyAdmin(signer, deployOverrides)
            proxyAdminAddress = proxyAdmin.address

            // Get receipt if available
            if (proxyAdmin.deployTransaction) {
                receipts.proxyAdmin =
                    await signer.provider!.getTransactionReceipt(
                        proxyAdmin.deployTransaction.hash
                    )
            }
        }

        validateAddress(proxyAdminAddress, 'ProxyAdmin address')

        // Step 3: Deploy TransparentUpgradeableProxy
        info('Deploying TransparentUpgradeableProxy')
        debug(`Implementation: ${implementationAddress}`)
        debug(`ProxyAdmin: ${proxyAdminAddress}`)
        debug(`Init data: ${initData}`)

        const proxy = await new TransparentUpgradeableProxy__factory(
            signer
        ).deploy(
            implementationAddress,
            proxyAdminAddress,
            initData,
            deployOverrides
        )

        await proxy.deployed()

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
 * @param signer - Ethers.js signer
 * @param proxies - Array of proxy deployment options (without proxyAdminAddress)
 * @param sharedProxyAdminAddress - Optional existing ProxyAdmin to reuse
 * @returns Array of deployment results
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory, Factory__factory } from '@contract-types'
 *
 * const signer = (await ethers.getSigners())[0]
 * const results = await deployMultipleProxies(signer, [
 *   { implementationFactory: BusinessLogicResolver__factory.connect(signer), initData: '0x' },
 *   { implementationFactory: Factory__factory.connect(signer), initData: '0x' }
 * ])
 * ```
 */
export async function deployMultipleProxies(
    signer: Signer,
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
        const proxyAdmin = await deployProxyAdmin(signer)
        proxyAdminAddress = proxyAdmin.address
        success(`Shared ProxyAdmin deployed at ${proxyAdminAddress}`)
    }

    // Deploy all proxies with shared ProxyAdmin
    for (const proxyOptions of proxies) {
        const result = await deployProxy(signer, {
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
 * @param provider - Ethers.js provider
 * @param proxyAddress - Address of the proxy
 * @returns Implementation address
 *
 * @example
 * ```typescript
 * const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
 * const implAddress = await getProxyImplementation(provider, '0x123...')
 * console.log(`Current implementation: ${implAddress}`)
 * ```
 */
export async function getProxyImplementation(
    provider: providers.Provider,
    proxyAddress: string
): Promise<string> {
    try {
        validateAddress(proxyAddress, 'proxy address')

        // Read implementation from EIP-1967 storage slot
        // keccak256("eip1967.proxy.implementation") - 1
        const implSlot =
            '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'

        const implBytes = await provider.getStorageAt(proxyAddress, implSlot)

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
 * @param provider - Ethers.js provider
 * @param proxyAddress - Address of the proxy
 * @returns ProxyAdmin address
 *
 * @example
 * ```typescript
 * const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
 * const adminAddress = await getProxyAdmin(provider, '0x123...')
 * console.log(`ProxyAdmin: ${adminAddress}`)
 * ```
 */
export async function getProxyAdmin(
    provider: providers.Provider,
    proxyAddress: string
): Promise<string> {
    try {
        validateAddress(proxyAddress, 'proxy address')

        // Read admin from EIP-1967 storage slot
        // keccak256("eip1967.proxy.admin") - 1
        const adminSlot =
            '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'

        const adminBytes = await provider.getStorageAt(proxyAddress, adminSlot)

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
