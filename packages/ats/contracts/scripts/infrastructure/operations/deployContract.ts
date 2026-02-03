// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy contract operation.
 *
 * Atomic operation for deploying a single contract with optional
 * constructor arguments and deployment configuration.
 *
 * @module core/operations/deployContract
 */

import { Contract, ContractFactory, ContractTransactionReceipt, Overrides } from "ethers";
import {
  DeploymentResult,
  debug,
  error as logError,
  extractRevertReason,
  formatGasUsage,
  info,
  success,
  validateAddress,
} from "@scripts/infrastructure";
import { verifyContractCode, VerificationOptions } from "@scripts/infrastructure";

/**
 * Options for deploying a contract.
 *
 * NOTE: contractName removed - factory already knows the contract name.
 */
export interface DeployContractOptions {
  args?: unknown[];
  overrides?: Overrides;
  confirmations?: number;
  silent?: boolean;
  /** Enable post-deployment verification (default: true) */
  verifyDeployment?: boolean;
  /** Verification options for bytecode and interface checks */
  verificationOptions?: VerificationOptions;
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
  options: DeployContractOptions = {},
): Promise<DeploymentResult> {
  const {
    args = [],
    overrides = {},
    confirmations = 1,
    silent = false,
    verifyDeployment = true,
    verificationOptions = {},
  } = options;

  // Get contract name from factory for logging
  const contractName = factory.constructor.name.replace("__factory", "") || "Contract";

  try {
    if (!silent) {
      info(`Deploying ${contractName}...`);
      if (args.length > 0) {
        debug(`Constructor args: ${JSON.stringify(args)}`);
      }
    }

    // Prepare deployment overrides
    const deployOverrides: Overrides = { ...overrides };

    // Note: Gas estimation in ethers v6 is done differently
    // For now, we rely on the network's estimation or explicit overrides

    // Deploy contract
    const contract = await factory.deploy(...args, deployOverrides);

    const deployTx = contract.deploymentTransaction();
    if (!silent && deployTx) {
      info(`Transaction sent: ${deployTx.hash}`);
    }

    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    // Validate deployment
    validateAddress(contractAddress, "deployed contract address");

    // Get transaction receipt for gas usage
    let receipt: ContractTransactionReceipt | null = null;
    if (deployTx) {
      receipt = await deployTx.wait(confirmations);
    }

    // Verify deployment (bytecode existence check)
    if (verifyDeployment) {
      const provider = factory.runner && "provider" in factory.runner ? factory.runner.provider : null;
      const verificationResult = await verifyContractCode(provider!, contractAddress, {
        ...verificationOptions,
        verbose: !silent,
      });

      if (!verificationResult.success) {
        if (!silent) {
          logError(`Deployment verification failed: ${verificationResult.error}`);
        }
        return {
          success: false,
          error: `Deployment verification failed: ${verificationResult.error}`,
        };
      }
    }

    if (receipt && deployTx) {
      const gasUsed = formatGasUsage(receipt, deployTx.gasLimit);
      if (!silent) {
        debug(gasUsed);
      }
    }

    if (!silent) {
      success(`${contractName} deployed at ${contractAddress}`);
    }

    return {
      success: true,
      address: contractAddress,
      transactionHash: receipt?.hash,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt ? Number(receipt.gasUsed) : undefined,
      contract: contract as unknown as Contract,
    };
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    if (!silent) {
      logError(`Failed to deploy ${contractName}: ${errorMessage}`);
    }

    return {
      success: false,
      error: errorMessage,
    };
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
