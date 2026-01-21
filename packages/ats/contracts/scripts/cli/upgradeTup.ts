#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * CLI entry point for upgrading TUP (TransparentUpgradeableProxy) contracts.
 *
 * This script provides a command-line interface for upgrading BLR and/or Factory
 * proxy implementations without redeploying the ProxyAdmin itself.
 *
 * Configuration via environment variables:
 *   NETWORK - Target network name (default: hedera-testnet)
 *   {NETWORK}_PRIVATE_KEY_0 - Private key for deployer account
 *   PROXY_ADMIN_ADDRESS - Address of ProxyAdmin contract (required)
 *   BLR_PROXY - Address of BLR proxy (optional if only upgrading Factory)
 *   FACTORY_PROXY - Address of Factory proxy (optional if only upgrading BLR)
 *   DEPLOY_NEW_BLR_IMPL - Deploy new BLR implementation (true/false)
 *   DEPLOY_NEW_FACTORY_IMPL - Deploy new Factory implementation (true/false)
 *   BLR_IMPLEMENTATION - Use existing BLR implementation address
 *   FACTORY_IMPLEMENTATION - Use existing Factory implementation address
 *   BLR_INIT_DATA - Initialization data for BLR upgradeAndCall (optional)
 *   FACTORY_INIT_DATA - Initialization data for Factory upgradeAndCall (optional)
 *
 * Usage:
 *   PROXY_ADMIN_ADDRESS=0x123... DEPLOY_NEW_BLR_IMPL=true npm run upgrade:tup:testnet
 *   PROXY_ADMIN_ADDRESS=0x123... BLR_IMPLEMENTATION=0xabc... npm run upgrade:tup:testnet
 *   PROXY_ADMIN_ADDRESS=0x123... BLR_PROXY=0x111... FACTORY_PROXY=0x222... npm run upgrade:tup:testnet
 *
 * @module cli/upgradeTup
 */

import { upgradeTupProxies } from "../workflows/upgradeTupProxies";
import { getAllNetworks, getNetworkConfig } from "@scripts/infrastructure";
import { Wallet, providers, ethers } from "ethers";

async function main() {
  // Get configuration from environment
  const network = process.env.NETWORK || "hedera-testnet";
  const proxyAdminAddress = process.env.PROXY_ADMIN_ADDRESS;
  const blrProxyAddress = process.env.BLR_PROXY;
  const factoryProxyAddress = process.env.FACTORY_PROXY;
  const deployNewBlrImpl = process.env.DEPLOY_NEW_BLR_IMPL === "true";
  const deployNewFactoryImpl = process.env.DEPLOY_NEW_FACTORY_IMPL === "true";
  const blrImplementationAddress = process.env.BLR_IMPLEMENTATION;
  const factoryImplementationAddress = process.env.FACTORY_IMPLEMENTATION;
  const blrInitData = process.env.BLR_INIT_DATA;
  const factoryInitData = process.env.FACTORY_INIT_DATA;

  console.log(`🔄 Starting TUP Proxy Upgrade`);
  console.log("=".repeat(60));
  console.log(`📡 Network: ${network}`);
  console.log(`🔐 ProxyAdmin: ${proxyAdminAddress || "NOT PROVIDED"}`);
  if (blrProxyAddress) {
    console.log(`  BLR Proxy: ${blrProxyAddress}`);
    console.log(`  Deploy: ${deployNewBlrImpl}, Implementation: ${blrImplementationAddress || "None"}`);
  }
  if (factoryProxyAddress) {
    console.log(`  Factory Proxy: ${factoryProxyAddress}`);
    console.log(`  Deploy: ${deployNewFactoryImpl}, Implementation: ${factoryImplementationAddress || "None"}`);
  }
  console.log("=".repeat(60));

  // Validate required address
  if (!proxyAdminAddress) {
    console.error(`❌ Missing PROXY_ADMIN_ADDRESS environment variable`);
    console.error(`   Usage: PROXY_ADMIN_ADDRESS=0x123... npm run upgrade:tup:${network.replace("hedera-", "")}`);
    process.exit(1);
  }

  if (!ethers.utils.isAddress(proxyAdminAddress)) {
    console.error(`❌ Invalid ProxyAdmin address: ${proxyAdminAddress}`);
    console.error(`   Must be a valid Ethereum address (0x...)`);
    process.exit(1);
  }

  // Validate addresses if provided
  const addressesToValidate: Array<[string, string]> = [];

  if (blrProxyAddress) {
    addressesToValidate.push([blrProxyAddress, "BLR proxy"]);
  }
  if (factoryProxyAddress) {
    addressesToValidate.push([factoryProxyAddress, "Factory proxy"]);
  }
  if (blrImplementationAddress) {
    addressesToValidate.push([blrImplementationAddress, "BLR implementation"]);
  }
  if (factoryImplementationAddress) {
    addressesToValidate.push([factoryImplementationAddress, "Factory implementation"]);
  }

  for (const [addr, name] of addressesToValidate) {
    if (!ethers.utils.isAddress(addr)) {
      console.error(`❌ Invalid ${name} address: ${addr}`);
      console.error(`   All addresses must be valid Ethereum addresses (0x...)`);
      process.exit(1);
    }
  }

  // Validate network configuration
  const availableNetworks = getAllNetworks();
  if (!availableNetworks.includes(network)) {
    console.error(`❌ Network '${network}' not configured in Configuration.ts`);
    console.log(`Available networks: ${availableNetworks.join(", ")}`);
    process.exit(1);
  }

  // Get network config and create signer
  const networkConfig = getNetworkConfig(network);

  const privateKeyEnvVar = `${network.toUpperCase().replace(/-/g, "_")}_PRIVATE_KEY_0`;
  const privateKey = process.env[privateKeyEnvVar];

  if (!privateKey) {
    console.error(`❌ Missing private key environment variable: ${privateKeyEnvVar}`);
    console.error(`   Set it with: export ${privateKeyEnvVar}=0x...`);
    process.exit(1);
  }

  const provider = new providers.JsonRpcProvider(networkConfig.jsonRpcUrl);
  const signer = new Wallet(privateKey, provider);

  console.log(`\n👤 Deployer: ${await signer.getAddress()}\n`);

  try {
    const result = await upgradeTupProxies(signer, network, {
      proxyAdminAddress,
      blrProxyAddress,
      factoryProxyAddress,
      deployNewBlrImpl,
      deployNewFactoryImpl,
      blrImplementationAddress,
      factoryImplementationAddress,
      blrInitData,
      factoryInitData,
    });

    console.log(`\n✓ Upgrade completed successfully!`);
    console.log(`  Proxies upgraded: ${result.summary.proxiesUpgraded}`);
    console.log(`  Proxies failed: ${result.summary.proxiesFailed}`);
    console.log(`  Total time: ${(result.summary.deploymentTime / 1000).toFixed(2)}s`);
    console.log(`  Total gas: ${result.summary.gasUsed}`);

    if (result.blrUpgrade) {
      console.log(`\n  BLR: ${result.blrUpgrade.upgraded ? "upgraded" : "unchanged"}`);
      if (result.blrUpgrade.transactionHash) {
        console.log(`    TX: ${result.blrUpgrade.transactionHash}`);
      }
    }

    if (result.factoryUpgrade) {
      console.log(`  Factory: ${result.factoryUpgrade.upgraded ? "upgraded" : "unchanged"}`);
      if (result.factoryUpgrade.transactionHash) {
        console.log(`    TX: ${result.factoryUpgrade.transactionHash}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Upgrade failed: ${error instanceof Error ? error.message : String(error)}`);

    if (error instanceof Error && error.stack) {
      console.error(`\nStack trace:`);
      console.error(error.stack);
    }

    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
