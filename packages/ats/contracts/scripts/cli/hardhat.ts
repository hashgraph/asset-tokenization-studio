#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Hardhat CLI entry point for ATS deployment.
 *
 * This script provides a command-line interface for deploying the complete
 * ATS system from within a Hardhat project. It reads configuration from the
 * Hardhat runtime environment and uses Hardhat's ethers integration.
 *
 * Usage (from within Hardhat project):
 *   npx ts-node scripts/cli/hardhat.ts
 *   or
 *   npm run deploy
 *
 * @module cli/hardhat
 */

import { deploySystemWithNewBlr } from "../workflows/deploySystemWithNewBlr";
import { getNetworkConfig, getAllNetworks, DEFAULT_BATCH_SIZE, info, success, error } from "@scripts/infrastructure";

/**
 * Main deployment function for Hardhat environment.
 */
async function main() {
  // Get network from Hardhat config
  const hre = await import("hardhat");
  const networkName = hre.network.name;

  info(`🚀 Starting ATS deployment on network: ${networkName}`);
  info("---");

  // Validate network configuration
  const availableNetworks = getAllNetworks();
  if (!availableNetworks.includes(networkName)) {
    error(`❌ Network '${networkName}' not configured in Configuration.ts`);
    info(`Available networks: ${availableNetworks.join(", ")}`);
    process.exit(1);
  }

  // Get network config
  const networkConfig = getNetworkConfig(networkName);
  info(`📡 RPC URL: ${networkConfig.jsonRpcUrl}`);

  // Get signer from Hardhat runtime
  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    error("❌ No signers available from Hardhat");
    process.exit(1);
  }
  const signer = signers[0];
  info(`👤 Deployer: ${await signer.getAddress()}`);

  // Check for TimeTravel mode from environment
  const useTimeTravel = process.env.USE_TIME_TRAVEL === "true";

  // Check for PartialBatchDeploy mode from environment
  const partialBatchDeploy = process.env.PARTIAL_BATCH_DEPLOY === "true";

  // Get batch size from environment or use DEFAULT_BATCH_SIZE constant
  const batchSize = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE) : DEFAULT_BATCH_SIZE;

  try {
    // Deploy system with new BLR
    const output = await deploySystemWithNewBlr(signer, networkName, {
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
