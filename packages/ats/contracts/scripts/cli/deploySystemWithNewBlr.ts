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
 * @module cli/deploySystemWithNewBlr
 */

import { deploySystemWithNewBlr } from "../workflows/deploySystemWithNewBlr";
import { DEFAULT_BATCH_SIZE, info, success, error } from "@scripts/infrastructure";
import { requireNetworkSigner, parseBooleanEnv, parseIntEnv } from "./shared";

/**
 * Main deployment function for standalone environment.
 */
async function main() {
  // Get network from environment (required)
  const { network, signer, address } = await requireNetworkSigner();

  const useTimeTravel = parseBooleanEnv("USE_TIMETRAVEL", false);
  const partialBatchDeploy = parseBooleanEnv("PARTIAL_BATCH_DEPLOY", false);
  const batchSize = parseIntEnv("BATCH_SIZE", DEFAULT_BATCH_SIZE);

  info(`🚀 Starting ATS deployment`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`⏰ TimeTravel: ${useTimeTravel ? "enabled" : "disabled"}`);
  info(`📦 PartialBatchDeploy: ${partialBatchDeploy ? "enabled" : "disabled"}`);
  info(`📊 Batch Size: ${batchSize}`);
  info("---");

  try {
    // Use signer from network configuration
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

export { main };

if (require.main === module) {
  main().catch((err) => {
    error("❌ Fatal error:", err);
    process.exit(1);
  });
}
