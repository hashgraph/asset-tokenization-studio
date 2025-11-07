#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Standalone CLI entry point for ATS deployment.
 *
 * This script provides a non-interactive command-line interface for deploying
 * the complete ATS system using plain ethers.js without requiring Hardhat.
 *
 * Configuration via environment variables:
 *   NETWORK - Target network name (default: hedera-testnet)
 *   {NETWORK}_PRIVATE_KEY_0 - Private key for deployer account
 *   USE_TIMETRAVEL - Enable TimeTravel mode (default: false)
 *
 * Usage:
 *   NETWORK=hedera-testnet npx ts-node scripts/cli/standalone.ts
 *   or
 *   npm run deploy:standalone
 *
 * @module cli/standalone
 */

import { deployCompleteSystem } from "../workflows/deployCompleteSystem";
import { getAllNetworks, getNetworkConfig } from "@scripts/infrastructure";
import { Wallet, providers } from "ethers";

/**
 * Main deployment function for standalone environment.
 */
async function main() {
  // Get network from environment
  const network = process.env.NETWORK || "hedera-testnet";
  const useTimeTravel = process.env.USE_TIMETRAVEL === "true";
  const partialBatchDeploy = process.env.PARTIAL_BATCH_DEPLOY === "true";
  const batchSize = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE) : 2;

  console.log(`🚀 Starting ATS deployment (standalone mode)`);
  console.log("=".repeat(60));
  console.log(`📡 Network: ${network}`);
  console.log(`⏰ TimeTravel: ${useTimeTravel ? "enabled" : "disabled"}`);
  console.log(`📦 PartialBatchDeploy: ${partialBatchDeploy ? "enabled" : "disabled"}`);
  console.log(`🔢 Batch Size: ${batchSize}`);
  console.log("=".repeat(60));

  // Validate network configuration
  const availableNetworks = getAllNetworks();
  if (!availableNetworks.includes(network)) {
    console.error(`❌ Network '${network}' not configured in Configuration.ts`);
    console.log(`Available networks: ${availableNetworks.join(", ")}`);
    process.exit(1);
  }

  try {
    // Get network configuration
    const networkConfig = getNetworkConfig(network);

    // Get private key from environment
    const networkPrefix = network.toUpperCase().replace(/-/g, "_");
    const privateKey = process.env[`${networkPrefix}_PRIVATE_KEY_0`];

    if (!privateKey) {
      console.error(
        `❌ Missing private key for network '${network}'. Set ${networkPrefix}_PRIVATE_KEY_0 environment variable.`,
      );
      process.exit(1);
    }

    // Create provider and signer
    const provider = new providers.JsonRpcProvider(networkConfig.jsonRpcUrl);
    const signer = new Wallet(privateKey, provider);

    console.log(`👤 Deployer: ${await signer.getAddress()}`);

    // Deploy complete system
    const output = await deployCompleteSystem(signer, network, {
      useTimeTravel,
      partialBatchDeploy,
      batchSize,
      saveOutput: true,
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ Deployment completed successfully!");
    console.log("=".repeat(60));
    console.log("\n📋 Deployment Summary:");
    console.log(`   ProxyAdmin: ${output.infrastructure.proxyAdmin.address}`);
    console.log(`   BLR Proxy: ${output.infrastructure.blr.proxy}`);
    console.log(`   Factory Proxy: ${output.infrastructure.factory.proxy}`);
    console.log(`   Total Facets: ${output.facets.length}`);
    console.log(`   Equity Config Version: ${output.configurations.equity.version}`);
    console.log(`   Bond Config Version: ${output.configurations.bond.version}`);
    console.log(`   Total Contracts: ${output.summary.totalContracts}`);
    console.log(`   Deployment Time: ${output.summary.deploymentTime}ms`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { main };
