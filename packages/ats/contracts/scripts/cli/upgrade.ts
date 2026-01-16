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
import { getAllNetworks, getNetworkConfig, DEFAULT_BATCH_SIZE } from "@scripts/infrastructure";
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
    console.error(`❌ Invalid CONFIGURATIONS value: ${configurationsStr}`);
    console.error(`   Must be one of: equity, bond, both`);
    process.exit(1);
  }

  console.log(`🔄 Starting ATS configuration upgrade`);
  console.log("=".repeat(60));
  console.log(`📡 Network: ${network}`);
  console.log(`🏭 BLR Address: ${blrAddress || "NOT PROVIDED"}`);
  console.log(`📦 Configurations: ${configurations}`);
  console.log(`⏰ TimeTravel: ${useTimeTravel ? "enabled" : "disabled"}`);
  console.log(`🔢 Batch Size: ${batchSize}`);
  if (proxyAddresses && proxyAddresses.length > 0) {
    console.log(`🔗 Proxy Updates: ${proxyAddresses.length} proxies`);
  }
  console.log("=".repeat(60));

  // Validate BLR address
  if (!blrAddress) {
    console.error(`❌ Missing BLR_ADDRESS environment variable`);
    console.error(`   Usage: BLR_ADDRESS=0x123... npm run upgrade:${network.replace("hedera-", "")}`);
    process.exit(1);
  }

  if (!ethers.utils.isAddress(blrAddress)) {
    console.error(`❌ Invalid BLR address: ${blrAddress}`);
    console.error(`   Must be a valid Ethereum address (0x...)`);
    process.exit(1);
  }

  // Validate proxy addresses if provided
  if (proxyAddresses) {
    for (const addr of proxyAddresses) {
      if (!ethers.utils.isAddress(addr)) {
        console.error(`❌ Invalid proxy address: ${addr}`);
        console.error(`   All addresses must be valid Ethereum addresses (0x...)`);
        process.exit(1);
      }
    }
  }

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
    console.log(`💰 Balance: ${ethers.utils.formatEther(await provider.getBalance(await signer.getAddress()))} ETH`);
    console.log("");

    // Upgrade configurations
    const output = await upgradeConfigurations(signer, network, {
      blrAddress,
      configurations,
      proxyAddresses,
      useTimeTravel,
      batchSize,
      saveOutput: true,
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ Upgrade completed successfully!");
    console.log("=".repeat(60));
    console.log("\n📋 Upgrade Summary:");
    console.log(`   BLR Address: ${output.blr.address} (external)`);
    console.log(`   Facets Deployed: ${output.summary.totalFacetsDeployed}`);
    console.log(`   Configurations Created: ${output.summary.configurationsCreated}`);

    if (output.configurations.equity) {
      console.log(
        `   Equity Config: v${output.configurations.equity.version} (${output.configurations.equity.facetCount} facets)`,
      );
    }
    if (output.configurations.bond) {
      console.log(
        `   Bond Config: v${output.configurations.bond.version} (${output.configurations.bond.facetCount} facets)`,
      );
    }

    if (output.proxyUpdates && output.proxyUpdates.length > 0) {
      console.log(`   Proxies Updated: ${output.summary.proxiesUpdated}/${output.proxyUpdates.length}`);
      if (output.summary.proxiesFailed > 0) {
        console.log(`   ⚠️  Proxies Failed: ${output.summary.proxiesFailed}`);
      }
    }

    console.log(`   Gas Used: ${output.summary.gasUsed}`);
    console.log(`   Time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`);
    console.log("");

    if (output.proxyUpdates && output.proxyUpdates.length > 0) {
      console.log("📝 Proxy Update Details:");
      for (const update of output.proxyUpdates) {
        const status = update.success ? "✅" : "❌";
        const version = update.success ? `v${update.previousVersion} → v${update.newVersion}` : "failed";
        console.log(`   ${status} ${update.proxyAddress}: ${version}`);
        if (!update.success && update.error) {
          console.log(`      Error: ${update.error}`);
        }
      }
      console.log("");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Upgrade failed:");
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
