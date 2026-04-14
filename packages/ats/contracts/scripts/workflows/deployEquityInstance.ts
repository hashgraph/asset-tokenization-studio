// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy an equity instance workflow.
 *
 * Deploys a new equity token instance via the Factory contract by:
 * 1. Validating all required addresses and parameters
 * 2. Connecting to the Factory contract
 * 3. Calling deployEquityFromFactory to create a new token diamond
 * 4. Optionally saving the deployment output
 *
 * @module workflows/deployEquityInstance
 */

import { Signer } from "ethers";
import { Factory__factory } from "@contract-types";
import type { ResolverProxy } from "@contract-types";
import {
  validateAddress,
  info,
  section,
  success,
  error as logError,
  saveDeploymentOutput,
  warn,
} from "@scripts/infrastructure";
import { deployEquityFromFactory } from "@scripts/domain";
import type { EquityDetailsDataParams, FactoryRegulationDataParams, SecurityDataParams } from "@scripts/domain";

// ============================================================================
// Types
// ============================================================================

/**
 * Options for deploying an equity instance.
 */
export interface DeployEquityInstanceOptions {
  /** Factory contract address */
  factoryAddress: string;

  /** Admin account address (defaults to signer address) */
  adminAccount?: string;

  /** Security token data */
  securityData: SecurityDataParams;

  /** Equity-specific details */
  equityDetails: EquityDetailsDataParams;

  /** Regulation data for the factory */
  regulationData: FactoryRegulationDataParams;

  /** Save output to a file (default: true) */
  saveOutput?: boolean;

  /** Custom output file path (optional) */
  outputPath?: string;
}

/**
 * Output of the deployEquityInstance workflow.
 */
export interface DeployEquityInstanceOutput {
  /** Network name */
  network: string;

  /** ISO timestamp of deployment */
  timestamp: string;

  /** Deployer address */
  deployer: string;

  /** Deployed equity instance */
  equity: {
    /** Diamond proxy address of the deployed token */
    address: string;
  };
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Deploy a new equity token equity instance via the Factory contract.
 *
 * Connects to an existing Factory deployment and uses it to deploy a new
 * equity token with the given security and equity parameters.
 *
 * @param signer - Ethers.js Signer for transaction signing
 * @param network - Network identifier (hedera-testnet, hedera-mainnet, etc.)
 * @param options - Equity instance deployment options
 * @param options.factoryAddress - Address of the deployed Factory proxy (required)
 * @param options.adminAccount - Admin address for the token (defaults to signer address)
 * @param options.securityData - Security token configuration
 * @param options.equityDetails - Equity-specific details
 * @param options.regulationData - Regulation type and sub-type data
 * @param options.saveOutput - Whether to save the output to a file (default: true)
 * @param options.outputPath - Custom output file path (optional)
 * @returns Promise resolving to the deployment output including the token address
 *
 * @example
 * ```typescript
 * const result = await deployEquityInstance(signer, 'hedera-testnet', {
 *   factoryAddress: '0x...',
 *   securityData: { ... },
 *   equityDetails: { ... },
 *   regulationData: { ... },
 *   saveOutput: true,
 * });
 * console.log(`Token deployed at: ${result.equity.address}`);
 * ```
 */
export async function deployEquityInstance(
  signer: Signer,
  network: string,
  options: DeployEquityInstanceOptions,
): Promise<DeployEquityInstanceOutput> {
  const { factoryAddress, securityData, equityDetails, regulationData, saveOutput = true, outputPath } = options;

  const deployer = await signer.getAddress();
  const adminAccount = options.adminAccount ?? deployer;

  section("Deploy Equity Instance");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🏭 Factory: ${factoryAddress}`);
  info(`🔑 Admin: ${adminAccount}`);
  info("═".repeat(60));

  // Validate required addresses
  info("\n🔍 Validating addresses...");
  validateAddress(factoryAddress, "Factory address");
  validateAddress(adminAccount, "Admin account address");
  validateAddress(securityData.resolver, "Resolver (BLR) address");
  success("✓ Addresses validated");

  // Connect to the Factory contract
  info("\n🔗 Connecting to Factory contract...");
  const factory = Factory__factory.connect(factoryAddress, signer);
  success(`✓ Factory connected at ${factoryAddress}`);

  // Deploy the equity token via factory
  info("\n🚀 Deploying equity token...");
  let tokenProxy: ResolverProxy;
  try {
    tokenProxy = await deployEquityFromFactory(
      {
        adminAccount,
        factory,
        securityData,
        equityDetails,
      },
      regulationData,
    );
  } catch (err) {
    logError(`Equity token deployment failed: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }

  const tokenAddress = await tokenProxy.getAddress();
  success(`✓ Equity token deployed at: ${tokenAddress}`);

  const output: DeployEquityInstanceOutput = {
    network,
    timestamp: new Date().toISOString(),
    deployer,
    equity: {
      address: tokenAddress,
    },
  };

  if (saveOutput) {
    const result = await saveDeploymentOutput({
      network,
      workflow: "deployEquityInstance",
      data: output,
      customPath: outputPath,
    });

    if (result.success) {
      info(`Deployment output saved to: ${result.filepath}`);
    } else {
      warn(`Warning: Could not save deployment output: ${result.error}`);
    }
  }

  success("\n✓ Equity instance deployment completed successfully!");
  info(`  Token address: ${tokenAddress}`);

  return output;
}
