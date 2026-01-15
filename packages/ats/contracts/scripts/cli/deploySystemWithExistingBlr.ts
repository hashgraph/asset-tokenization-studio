#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * CLI entry point for deploying ATS system with an existing BusinessLogicResolver (BLR).
 *
 * This script provides a command-line interface for deploying system components
 * (facets, configurations, Factory) against an existing BLR infrastructure.
 *
 * Useful for:
 * - Deploying new configurations to existing BLR
 * - Multi-tenant scenarios with shared infrastructure
 * - Partial deployments in phased rollouts
 * - Testing facet updates against stable BLR instance
 *
 * Configuration via environment variables:
 *   NETWORK - Target network name (required)
 *   {NETWORK}_PRIVATE_KEY_0 - Private key for deployer account
 *   BLR_ADDRESS - Address of existing BLR proxy (required)
 *   USE_TIMETRAVEL - Enable TimeTravel mode (default: false)
 *   DEPLOY_FACTORY - Deploy Factory contract (default: true)
 *   BATCH_SIZE - Number of facets per batch (optional, uses default if not set)
 *   CONFIRMATIONS - Number of confirmations to wait (optional, uses network default)
 *
 * Usage:
 *   NETWORK=hedera-testnet BLR_ADDRESS=0x123... npm run deploy:existingBlr
 *   NETWORK=local BLR_ADDRESS=0x123... DEPLOY_FACTORY=false npm run deploy:existingBlr
 *   NETWORK=hedera-testnet BLR_ADDRESS=0x123... USE_TIMETRAVEL=true npm run deploy:existingBlr
 *
 * @module cli/deploySystemWithExistingBlr
 */

import { deploySystemWithExistingBlr } from "../workflows/deploySystemWithExistingBlr";
import { info, success, error } from "@scripts/infrastructure";
import { requireNetworkSigner, requireValidAddress, parseBooleanEnv, parseIntEnv } from "./shared";

/**
 * Main deployment function for existing BLR.
 */
async function main() {
  // Get network from environment (required)
  const { network, signer, address } = await requireNetworkSigner();

  // Get required BLR address
  const blrAddress = requireValidAddress(process.env.BLR_ADDRESS, "BLR_ADDRESS");

  const useTimeTravel = parseBooleanEnv("USE_TIMETRAVEL", false);
  const deployFactory = parseBooleanEnv("DEPLOY_FACTORY", true);
  const batchSize = parseIntEnv("BATCH_SIZE", 0); // 0 = use workflow default
  const confirmations = parseIntEnv("CONFIRMATIONS", 0); // 0 = use network default

  info(`🚀 Starting ATS deployment with existing BLR`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${address}`);
  info(`🔗 Existing BLR: ${blrAddress}`);
  info(`⏰ TimeTravel: ${useTimeTravel ? "enabled" : "disabled"}`);
  info(`🏭 Deploy Factory: ${deployFactory ? "yes" : "no"}`);
  if (batchSize > 0) {
    info(`📊 Batch Size: ${batchSize}`);
  }
  if (confirmations > 0) {
    info(`⏳ Confirmations: ${confirmations}`);
  }
  info("---");

  try {
    // Deploy system with existing BLR
    const output = await deploySystemWithExistingBlr(signer, network, blrAddress, {
      useTimeTravel,
      deployFactory,
      ...(batchSize > 0 && { batchSize }),
      ...(confirmations > 0 && { confirmations }),
      saveOutput: true,
    });

    info("---");
    success("✅ Deployment completed successfully!");
    info("---");
    info("📋 Deployment Summary:");
    info(`   Existing BLR Proxy: ${blrAddress}`);
    info(`   ProxyAdmin: ${output.infrastructure.proxyAdmin.address}`);
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
