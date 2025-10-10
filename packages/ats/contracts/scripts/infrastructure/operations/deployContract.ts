// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy contract operation.
 *
 * Atomic operation for deploying a single contract with optional
 * constructor arguments and deployment configuration.
 *
 * @module core/operations/deployContract
 */

import { Overrides } from 'ethers'
import {
    DeploymentProvider,
    DeploymentResult,
    debug,
    error as logError,
    estimateGasLimit,
    extractRevertReason,
    formatGasUsage,
    getGasPrice,
    info,
    success,
    validateAddress,
    waitForTransaction,
} from '@scripts/infrastructure'

/**
 * Options for deploying a contract.
 */
export interface DeployContractOptions {
    contractName: string
    args?: unknown[]
    overrides?: Overrides
    confirmations?: number
    gasMultiplier?: number
    silent?: boolean
}

/**
 * Deploy a single contract.
 *
 * @param provider - Deployment provider
 * @param options - Deployment options
 * @returns Deployment result with contract instance
 * @throws Error if deployment fails
 *
 * @example
 * ```typescript
 * const result = await deployContract(provider, {
 *   contractName: 'AccessControlFacet',
 *   confirmations: 2,
 *   gasMultiplier: 1.2
 * })
 * console.log(`Deployed at: ${result.address}`)
 * ```
 */
export async function deployContract(
    provider: DeploymentProvider,
    options: DeployContractOptions
): Promise<DeploymentResult> {
    const {
        contractName,
        args = [],
        overrides = {},
        confirmations = 1,
        gasMultiplier = 1.0,
        silent = false,
    } = options

    try {
        if (!silent) {
            info(`Deploying ${contractName}...`)
            if (args.length > 0) {
                debug(`Constructor args: ${JSON.stringify(args)}`)
            }
        }

        // Get contract factory
        const factory = await provider.getFactory(contractName)

        // Prepare overrides with gas price if needed
        const deployOverrides: Overrides = { ...overrides }
        if (gasMultiplier !== 1.0 && !deployOverrides.gasPrice) {
            const ethProvider = provider.getProvider()
            const gasPrice = await getGasPrice(ethProvider, gasMultiplier)
            deployOverrides.gasPrice = gasPrice
            debug(
                `Using gas price: ${gasPrice.toString()} (${gasMultiplier}x multiplier)`
            )
        }

        // Estimate gas if not provided
        if (!deployOverrides.gasLimit) {
            try {
                const estimated = await factory.signer.estimateGas(
                    factory.getDeployTransaction(...args, deployOverrides)
                )
                deployOverrides.gasLimit = estimateGasLimit(estimated, 1.2)
                debug(`Estimated gas limit: ${deployOverrides.gasLimit}`)
            } catch (err) {
                debug(`Could not estimate gas: ${extractRevertReason(err)}`)
            }
        }

        // Deploy contract
        const contract = await provider.deploy(factory, args, deployOverrides)

        if (!silent) {
            info(`Transaction sent: ${contract.deployTransaction.hash}`)
        }

        // Wait for deployment
        const receipt = await waitForTransaction(
            contract.deployTransaction,
            confirmations,
            120000 // 2 minute timeout
        )

        // Validate deployment
        validateAddress(contract.address, 'deployed contract address')

        const gasUsed = formatGasUsage(
            receipt,
            contract.deployTransaction.gasLimit
        )

        if (!silent) {
            success(`${contractName} deployed at ${contract.address}`)
            debug(gasUsed)
        }

        return {
            success: true,
            address: contract.address,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toNumber(),
            contract,
        }
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        if (!silent) {
            logError(`Failed to deploy ${contractName}: ${errorMessage}`)
        }

        return {
            success: false,
            error: errorMessage,
        }
    }
}

/**
 * Deploy multiple contracts in sequence.
 *
 * @param provider - Deployment provider
 * @param contracts - Array of deployment options
 * @returns Map of contract names to deployment results
 *
 * @example
 * ```typescript
 * const results = await deployContracts(provider, [
 *   { contractName: 'AccessControlFacet' },
 *   { contractName: 'KycFacet' },
 *   { contractName: 'PauseFacet' }
 * ])
 *
 * for (const [name, result] of results) {
 *   if (result.success) {
 *     console.log(`${name}: ${result.address}`)
 *   }
 * }
 * ```
 */
export async function deployContracts(
    provider: DeploymentProvider,
    contracts: DeployContractOptions[]
): Promise<Map<string, DeploymentResult>> {
    const results = new Map<string, DeploymentResult>()

    for (const options of contracts) {
        const result = await deployContract(provider, options)
        results.set(options.contractName, result)

        // Stop on first failure
        if (!result.success) {
            logError(`Deployment failed at ${options.contractName}, stopping`)
            break
        }
    }

    return results
}

/**
 * Deploy contracts with custom names (for contracts with different deployment names).
 *
 * @param provider - Deployment provider
 * @param contracts - Array of contracts with custom identifiers
 * @returns Map of identifiers to deployment results
 *
 * @example
 * ```typescript
 * const results = await deployContractsWithNames(provider, [
 *   { id: 'facet1', contractName: 'AccessControlFacet' },
 *   { id: 'facet2', contractName: 'AccessControlFacet' } // Deploy same contract twice
 * ])
 * ```
 */
export async function deployContractsWithNames(
    provider: DeploymentProvider,
    contracts: Array<{ id: string } & DeployContractOptions>
): Promise<Map<string, DeploymentResult>> {
    const results = new Map<string, DeploymentResult>()

    for (const { id, ...options } of contracts) {
        const result = await deployContract(provider, options)
        results.set(id, result)

        if (!result.success) {
            logError(`Deployment failed at ${id}, stopping`)
            break
        }
    }

    return results
}

/**
 * Verify a deployed contract exists at an address.
 *
 * @param provider - Deployment provider
 * @param address - Contract address to verify
 * @param contractName - Expected contract name (optional, for logging)
 * @returns true if contract exists (has code)
 *
 * @example
 * ```typescript
 * const exists = await verifyDeployedContract(provider, '0x123...', 'AccessControlFacet')
 * ```
 */
export async function verifyDeployedContract(
    provider: DeploymentProvider,
    address: string,
    contractName?: string
): Promise<boolean> {
    try {
        validateAddress(address, 'contract address')
        const ethProvider = provider.getProvider()
        const code = await ethProvider.getCode(address)

        const exists = code !== '0x'
        if (contractName) {
            if (exists) {
                debug(`${contractName} verified at ${address}`)
            } else {
                logError(`No contract found at ${address} for ${contractName}`)
            }
        }

        return exists
    } catch (err) {
        if (contractName) {
            logError(
                `Error verifying ${contractName} at ${address}: ${extractRevertReason(err)}`
            )
        }
        return false
    }
}
