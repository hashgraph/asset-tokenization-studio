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
 *   NETWORK - Target network name (default: hedera-testnet)
 *   {NETWORK}_PRIVATE_KEY_0 - Private key for deployer account
 *   BLR_ADDRESS - Address of existing BusinessLogicResolver (required)
 *   PROXY_ADDRESSES - Comma-separated list of proxy addresses to update (optional)
 *   CONFIGURATIONS - Which configs to create: 'equity', 'bond', or 'both' (default: 'both')
 *   USE_TIMETRAVEL - Enable TimeTravel mode (default: false)
 *
 * Usage:
 *   BLR_ADDRESS=0x123... npm run upgrade:testnet
 *   BLR_ADDRESS=0x123... PROXY_ADDRESSES=0xabc...,0xdef... npm run upgrade:testnet
 *   BLR_ADDRESS=0x123... CONFIGURATIONS=equity npm run upgrade:testnet
 *
 * @module cli/upgrade
 */

import { upgradeConfigurations } from "../workflows/upgradeConfigurations";
import {
  getAllNetworks,
  getNetworkConfig,
  DEFAULT_BATCH_SIZE,
  info,
  success,
  error,
  warn,
} from "@scripts/infrastructure";
import { Wallet, providers, ethers } from "ethers";

/**
 * Main upgrade function for standalone environment.
 */
async function main() {
  // Get configuration from environment
  const network = process.env.NETWORK || "hedera-testnet";
  const blrAddress = process.env.BLR_ADDRESS;
  const proxyAddressesStr = process.env.PROXY_ADDRESSES;
  const configurationsStr = process.env.CONFIGURATIONS || "both";
  const useTimeTravel = process.env.USE_TIMETRAVEL === "true";
  const batchSize = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE) : DEFAULT_BATCH_SIZE;

  // Parse proxy addresses
  const proxyAddresses = proxyAddressesStr
    ? proxyAddressesStr
        .split(",")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0)
    : undefined;

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
  info(`📍 BLR Address: ${blrAddress || "NOT PROVIDED"}`);
  info(`⚙️ Configurations: ${configurations}`);
  info(`⏰ TimeTravel: ${useTimeTravel ? "enabled" : "disabled"}`);
  info(`📊 Batch Size: ${batchSize}`);
  if (proxyAddresses && proxyAddresses.length > 0) {
    info(`Proxy Updates: ${proxyAddresses.length} proxies`);
  }
  info("---");

  // Validate BLR address
  if (!blrAddress) {
    error(`❌ Missing BLR_ADDRESS environment variable`);
    error(`Usage: BLR_ADDRESS=0x123... npm run upgrade:${network.replace("hedera-", "")}`);
    process.exit(1);
  }

  if (!ethers.utils.isAddress(blrAddress)) {
    error(`❌ Invalid BLR address: ${blrAddress}`);
    error(`Must be a valid Ethereum address (0x...)`);
    process.exit(1);
  }

  // Validate proxy addresses if provided
  if (proxyAddresses) {
    for (const addr of proxyAddresses) {
      if (!ethers.utils.isAddress(addr)) {
        error(`❌ Invalid proxy address: ${addr}`);
        error(`All addresses must be valid Ethereum addresses (0x...)`);
        process.exit(1);
      }
    }
  }

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
    info(`💰 Balance: ${ethers.utils.formatEther(await provider.getBalance(await signer.getAddress()))} ETH`);

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

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    error("❌ Fatal error:", err);
    process.exit(1);
  });
}

export { main };
