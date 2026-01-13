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
 *   npm run deploy
 *   or
 *   npm run deploy:hedera:testnet
 *
 * @module cli/standalone
 */

import { deploySystemWithNewBlr } from "../workflows/deploySystemWithNewBlr";
import { getAllNetworks, getNetworkConfig, DEFAULT_BATCH_SIZE, info, success, error } from "@scripts/infrastructure";
import { Wallet, providers } from "ethers";

/**
 * Main deployment function for standalone environment.
 */
async function main() {
  // Get network from environment
  const network = process.env.NETWORK || "hedera-testnet";
  const useTimeTravel = process.env.USE_TIMETRAVEL === "true";
  const partialBatchDeploy = process.env.PARTIAL_BATCH_DEPLOY === "true";
  const batchSize = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE) : DEFAULT_BATCH_SIZE;

  info(`🚀 Starting ATS deployment (standalone mode)`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`⏰ TimeTravel: ${useTimeTravel ? "enabled" : "disabled"}`);
  info(`📦 PartialBatchDeploy: ${partialBatchDeploy ? "enabled" : "disabled"}`);
  info(`📊 Batch Size: ${batchSize}`);
  info("---");

  // Validate network configuration
  const availableNetworks = getAllNetworks();
  if (!availableNetworks.includes(network)) {
    error(`❌ Network '${network}' not configured in Configuration.ts`);
    info(`Available networks: ${availableNetworks.join(", ")}`);
    process.exit(1);
  }

  try {
    // Get network configuration
    const networkConfig = getNetworkConfig(network);

    // Get private key from environment
    const networkPrefix = network.toUpperCase().replace(/-/g, "_");
    const privateKey = process.env[`${networkPrefix}_PRIVATE_KEY_0`];

    if (!privateKey) {
      error(
        `❌ Missing private key for network '${network}'. Set ${networkPrefix}_PRIVATE_KEY_0 environment variable.`,
      );
      process.exit(1);
    }

    // Create provider and signer
    const provider = new providers.JsonRpcProvider(networkConfig.jsonRpcUrl);
    const signer = new Wallet(privateKey, provider);

    info(`👤 Deployer: ${await signer.getAddress()}`);

    // Deploy system with new BLR
    const output = await deploySystemWithNewBlr(signer, network, {
      useTimeTravel,
      partialBatchDeploy,
      batchSize,
      saveOutput: true,
    });

    info("---");
    success("✅ Deployment completed successfully!");
    info("---");
    info("📋 Deployment Summary:");
    info(`   ProxyAdmin: ${output.infrastructure.proxyAdmin.address}`);
    info(`   BLR Proxy: ${output.infrastructure.blr.proxy}`);
    info(`   Factory Proxy: ${output.infrastructure.factory.proxy}`);
    info(`   Total Facets: ${output.facets.length}`);
    info(`   Equity Config Version: ${output.configurations.equity.version}`);
    info(`   Bond Config Version: ${output.configurations.bond.version}`);
    info(`   Total Contracts: ${output.summary.totalContracts}`);

    process.exit(0);
  } catch (err) {
    error("❌ Deployment failed:", err);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    error("❌ Fatal error:", err);
    process.exit(1);
  });
}

export { main };
