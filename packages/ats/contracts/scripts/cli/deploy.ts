#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * CLI entry point for ATS deployment.
 *
 * This script provides a non-interactive command-line interface for deploying
 * the complete ATS system using plain ethers.js without requiring Hardhat.
 *
 * Configuration via environment variables:
 *   NETWORK - Target network name (required)
 *   {NETWORK}_PRIVATE_KEY_0 - Private key for deployer account
 *   USE_TIMETRAVEL - Enable TimeTravel mode (default: false)
 *
 * Usage:
 *   NETWORK=hedera-testnet npm run deploy
 *   or
 *   npm run deploy:hedera:testnet
 *
 * @module cli/deploy
 */

import { deploySystemWithNewBlr } from "../workflows/deploySystemWithNewBlr";
import { getAllNetworks, DEFAULT_BATCH_SIZE, info, success, error, createNetworkSigner } from "@scripts/infrastructure";

/**
 * Main deployment function for standalone environment.
 */
async function main() {
  // Get network from environment (required)
  const network = process.env.NETWORK;

  if (!network) {
    error("❌ Missing NETWORK environment variable.");
    error("Usage: NETWORK=hedera-testnet npm run deploy");
    const availableNetworks = getAllNetworks();
    info(`Available networks: ${availableNetworks.join(", ")}`);
    process.exit(1);
  }

  const useTimeTravel = process.env.USE_TIMETRAVEL === "true";
  const partialBatchDeploy = process.env.PARTIAL_BATCH_DEPLOY === "true";
  const batchSize = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE) : DEFAULT_BATCH_SIZE;

  info(`🚀 Starting ATS deployment`);
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
    // Create signer from network configuration
    const { signer, address } = await createNetworkSigner(network);
    info(`👤 Deployer: ${address}`);

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
