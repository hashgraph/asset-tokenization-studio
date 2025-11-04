// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy contract operation.
 *
 * Atomic operation for deploying a single contract with optional
 * constructor arguments and deployment configuration.
 *
 * @module core/operations/deployContract
 */

import { ContractFactory, Overrides, providers } from 'ethers'
import {
    DEFAULT_TRANSACTION_TIMEOUT,
    DeploymentResult,
    debug,
    error as logError,
    estimateGasLimit,
    extractRevertReason,
    formatGasUsage,
    info,
    success,
    validateAddress,
    waitForTransaction,
} from '@scripts/infrastructure'

/**
 * Options for deploying a contract.
 *
 * NOTE: contractName removed - factory already knows the contract name.
 */
export interface DeployContractOptions {
    args?: unknown[]
    overrides?: Overrides
    confirmations?: number
    silent?: boolean
}

/**
 * Deploy a single contract using a ContractFactory.
 *
 * Refactored to take ContractFactory directly instead of provider + name.
 * Use with TypeChain factories or ethers.getContractFactory().
 *
 * @param factory - Contract factory (from TypeChain or ethers)
 * @param options - Deployment options
 * @returns Deployment result with contract instance
 *
 * @example
 * ```typescript
 * // With TypeChain
 * import { AccessControlFacet__factory } from '@contract-types'
 *
 * const factory = new AccessControlFacet__factory(signer)
 * const result = await deployContract(factory, {
 *   confirmations: 2,
 *   overrides: { gasLimit: 5000000 }
 * })
 * console.log(`Deployed at: ${result.address}`)
 *
 * // With Hardhat ethers
 * const factory = await ethers.getContractFactory('AccessControlFacet', signer)
 * const result = await deployContract(factory, { confirmations: 1 })
 * ```
 */
export async function deployContract(
    factory: ContractFactory,
    options: DeployContractOptions = {}
): Promise<DeploymentResult> {
    const {
        args = [],
        overrides = {},
        confirmations = 1,
        silent = false,
    } = options

    // Get contract name from factory for logging
    const contractName =
        factory.constructor.name.replace('__factory', '') || 'Contract'

    try {
        if (!silent) {
            info(`Deploying ${contractName}...`)
            if (args.length > 0) {
                debug(`Constructor args: ${JSON.stringify(args)}`)
            }
        }

        // Prepare deployment overrides
        const deployOverrides: Overrides = { ...overrides }

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
        const contract = await factory.deploy(...args, deployOverrides)

        if (!silent) {
            info(`Transaction sent: ${contract.deployTransaction.hash}`)
        }

        // Wait for deployment
        const receipt = await waitForTransaction(
            contract.deployTransaction,
            confirmations,
            DEFAULT_TRANSACTION_TIMEOUT
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
 * REMOVED: This function is no longer needed with direct factory usage.
 * Use a simple loop with your factories instead:
 *
 * @example
 * ```typescript
 * const results = new Map()
 * for (const factory of factories) {
 *   const result = await deployContract(factory)
 *   results.set(factory.constructor.name, result)
 * }
 * ```
 *
 * @deprecated Use direct loop with factories
 */

/**
 * Verify a deployed contract exists at an address.
 *
 * @param provider - ethers.js Provider
 * @param address - Contract address to verify
 * @param contractName - Expected contract name (optional, for logging)
 * @returns true if contract exists (has code)
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 * const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
 * const exists = await verifyDeployedContract(provider, '0x123...', 'AccessControlFacet')
 * ```
 */
export async function verifyDeployedContract(
    provider: providers.Provider,
    address: string,
    contractName?: string
): Promise<boolean> {
    try {
        validateAddress(address, 'contract address')
        const code = await provider.getCode(address)

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
