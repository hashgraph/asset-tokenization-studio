#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * CLI entry point for upgrading ATS configurations.
 *
 * This script provides a command-line interface for upgrading existing
 * configurations by deploying new facets and creating new configuration versions
 * without redeploying the entire infrastructure.
 *
 * Configuration via environment variables:
 *   NETWORK - Target network name (required)
 *   {NETWORK}_PRIVATE_KEY_0 - Private key for deployer account
 *   BLR_ADDRESS - Address of existing BusinessLogicResolver (required)
 *   PROXY_ADDRESSES - Comma-separated list of proxy addresses to update (optional)
 *   CONFIGURATIONS - Which configs to create: 'equity', 'bond', or 'both' (default: 'both')
 *   USE_TIMETRAVEL - Enable TimeTravel mode (default: false)
 *
 * Usage:
 *   NETWORK=hedera-testnet BLR_ADDRESS=0x123... npm run upgrade
 *   NETWORK=hedera-testnet BLR_ADDRESS=0x123... PROXY_ADDRESSES=0xabc...,0xdef... npm run upgrade
 *   NETWORK=hedera-testnet BLR_ADDRESS=0x123... CONFIGURATIONS=equity npm run upgrade
 *
 * @module cli/upgradeConfigurations
 */

import { upgradeConfigurations } from "../workflows/upgradeConfigurations";
import { DEFAULT_BATCH_SIZE, info, success, error, warn } from "@scripts/infrastructure";
import {
  requireNetworkSigner,
  requireValidAddress,
  parseOptionalAddressList,
  parseBooleanEnv,
  parseIntEnv,
} from "./shared";
import { ethers } from "ethers";

/**
 * Main upgrade function for standalone environment.
 */
async function main() {
  // Get network from environment (required)
  const { network, signer, address } = await requireNetworkSigner();

  const blrAddress = requireValidAddress(process.env.BLR_ADDRESS, "BLR_ADDRESS");
  const proxyAddresses = parseOptionalAddressList(process.env.PROXY_ADDRESSES, "PROXY_ADDRESSES");
  const configurationsStr = process.env.CONFIGURATIONS || "both";
  const useTimeTravel = parseBooleanEnv("USE_TIMETRAVEL", false);
  const batchSize = parseIntEnv("BATCH_SIZE", DEFAULT_BATCH_SIZE);

  // Validate configurations parameter
  const configurations = configurationsStr as "equity" | "bond" | "both";
  if (!["equity", "bond", "both"].includes(configurations)) {
    error(`❌ Invalid CONFIGURATIONS value: ${configurationsStr}`);
    error(`Must be one of: equity, bond, both`);
    process.exit(1);
  }

  info(`🔄 Starting ATS configuration upgrade`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`📍 BLR Address: ${blrAddress}`);
  info(`⚙️ Configurations: ${configurations}`);
  info(`⏰ TimeTravel: ${useTimeTravel ? "enabled" : "disabled"}`);
  info(`📊 Batch Size: ${batchSize}`);
  if (proxyAddresses && proxyAddresses.length > 0) {
    info(`Proxy Updates: ${proxyAddresses.length} proxies`);
  }
  info("---");

  try {
    // Use signer from network configuration
    info(`👤 Deployer: ${address}`);
    info(`💰 Balance: ${ethers.formatEther(await signer.provider!.getBalance(address))} ETH`);

    // Upgrade configurations
    const output = await upgradeConfigurations(signer, network, {
      blrAddress,
      configurations,
      proxyAddresses,
      useTimeTravel,
      batchSize,
      saveOutput: true,
    });

    info("---");
    success("✅ Upgrade completed successfully!");
    info("---");
    info("📋 Upgrade Summary:");
    info(`   BLR Address: ${output.blr.address} (external)`);
    info(`   Facets Deployed: ${output.summary.totalFacetsDeployed}`);
    info(`   Configurations Created: ${output.summary.configurationsCreated}`);

    if (output.configurations.equity) {
      info(
        `   Equity Config: v${output.configurations.equity.version} (${output.configurations.equity.facetCount} facets)`,
      );
    }
    if (output.configurations.bond) {
      info(`   Bond Config: v${output.configurations.bond.version} (${output.configurations.bond.facetCount} facets)`);
    }

    if (output.proxyUpdates && output.proxyUpdates.length > 0) {
      info(`   Proxies Updated: ${output.summary.proxiesUpdated}/${output.proxyUpdates.length}`);
      if (output.summary.proxiesFailed > 0) {
        warn(`⚠️ Proxies Failed: ${output.summary.proxiesFailed}`);
      }
    }

    info(`   Gas Used: ${output.summary.gasUsed}`);
    info(`   Time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`);

    if (output.proxyUpdates && output.proxyUpdates.length > 0) {
      info("📝 Proxy Update Details:");
      for (const update of output.proxyUpdates) {
        const status = update.success ? "✅" : "❌";
        const version = update.success ? `v${update.previousVersion} → v${update.newVersion}` : "failed";
        info(`   ${status} ${update.proxyAddress}: ${version}`);
        if (!update.success && update.error) {
          info(`      Error: ${update.error}`);
        }
      }
    }

    process.exit(0);
  } catch (err) {
    error("❌ Upgrade failed:", err);
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
