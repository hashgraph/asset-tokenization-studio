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
import { getAllNetworks, getNetworkConfig, info, success, error } from "@scripts/infrastructure";
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

  info(`🔄 Starting TUP Proxy Upgrade`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`🔑 ProxyAdmin: ${proxyAdminAddress || "NOT PROVIDED"}`);
  if (blrProxyAddress) {
    info(`  BLR Proxy: ${blrProxyAddress}`);
    info(`  Deploy: ${deployNewBlrImpl}, Implementation: ${blrImplementationAddress || "None"}`);
  }
  if (factoryProxyAddress) {
    info(`  Factory Proxy: ${factoryProxyAddress}`);
    info(`  Deploy: ${deployNewFactoryImpl}, Implementation: ${factoryImplementationAddress || "None"}`);
  }
  info("---");

  // Validate required address
  if (!proxyAdminAddress) {
    error(`❌ Missing PROXY_ADMIN_ADDRESS environment variable`);
    error(`Usage: PROXY_ADMIN_ADDRESS=0x123... npm run upgrade:tup:${network.replace("hedera-", "")}`);
    process.exit(1);
  }

  if (!ethers.utils.isAddress(proxyAdminAddress)) {
    error(`❌ Invalid ProxyAdmin address: ${proxyAdminAddress}`);
    error(`Must be a valid Ethereum address (0x...)`);
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
      error(`❌ Invalid ${name} address: ${addr}`);
      error(`All addresses must be valid Ethereum addresses (0x...)`);
      process.exit(1);
    }
  }

  // Validate network configuration
  const availableNetworks = getAllNetworks();
  if (!availableNetworks.includes(network)) {
    error(`❌ Network '${network}' not configured in Configuration.ts`);
    info(`Available networks: ${availableNetworks.join(", ")}`);
    process.exit(1);
  }

  // Get network config and create signer
  const networkConfig = getNetworkConfig(network);

  const privateKeyEnvVar = `${network.toUpperCase().replace(/-/g, "_")}_PRIVATE_KEY_0`;
  const privateKey = process.env[privateKeyEnvVar];

  if (!privateKey) {
    error(`❌ Missing private key environment variable: ${privateKeyEnvVar}`);
    error(`Set it with: export ${privateKeyEnvVar}=0x...`);
    process.exit(1);
  }

  const provider = new providers.JsonRpcProvider(networkConfig.jsonRpcUrl);
  const signer = new Wallet(privateKey, provider);

  info(`👤 Deployer: ${await signer.getAddress()}`);

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

    success(`✅ Upgrade completed successfully!`);
    info("📋 Summary:");
    info(`   Proxies upgraded: ${result.summary.proxiesUpgraded}`);
    info(`   Proxies failed: ${result.summary.proxiesFailed}`);
    info(`   Total time: ${(result.summary.deploymentTime / 1000).toFixed(2)}s`);
    info(`   Total gas: ${result.summary.gasUsed}`);

    if (result.blrUpgrade) {
      info(`📦 BLR: ${result.blrUpgrade.upgraded ? "✅ upgraded" : "unchanged"}`);
      if (result.blrUpgrade.transactionHash) {
        info(`   TX: ${result.blrUpgrade.transactionHash}`);
      }
    }

    if (result.factoryUpgrade) {
      info(`🏭 Factory: ${result.factoryUpgrade.upgraded ? "✅ upgraded" : "unchanged"}`);
      if (result.factoryUpgrade.transactionHash) {
        info(`   TX: ${result.factoryUpgrade.transactionHash}`);
      }
    }

    process.exit(0);
  } catch (err) {
    error(`❌ Upgrade failed: ${err instanceof Error ? err.message : String(err)}`);

    if (err instanceof Error && err.stack) {
      error(`Stack trace:\n${err.stack}`);
    }

    process.exit(1);
  }
}

main().catch((err) => {
  error("❌ Fatal error:", err);
  process.exit(1);
});
