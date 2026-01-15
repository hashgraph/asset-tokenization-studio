#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * CLI entry point for upgrading TUP (TransparentUpgradeableProxy) contracts.
 *
 * This script provides a command-line interface for upgrading BLR and/or Factory
 * proxy implementations without redeploying the ProxyAdmin itself.
 *
 * Configuration via environment variables:
 *   NETWORK - Target network name (required)
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
 *   NETWORK=hedera-testnet PROXY_ADMIN_ADDRESS=0x123... DEPLOY_NEW_BLR_IMPL=true npm run upgrade:tup
 *   NETWORK=hedera-testnet PROXY_ADMIN_ADDRESS=0x123... BLR_IMPLEMENTATION=0xabc... npm run upgrade:tup
 *   NETWORK=hedera-testnet PROXY_ADMIN_ADDRESS=0x123... BLR_PROXY=0x111... FACTORY_PROXY=0x222... npm run upgrade:tup
 *
 * @module cli/upgradeTupProxies
 */

import { upgradeTupProxies } from "../workflows/upgradeTupProxies";
import { info, success, error } from "@scripts/infrastructure";
import { requireNetworkSigner, requireValidAddress, validateOptionalAddress, parseBooleanEnv } from "./shared";

async function main() {
  // Get network from environment (required)
  const { network, signer, address } = await requireNetworkSigner();

  const proxyAdminAddress = requireValidAddress(process.env.PROXY_ADMIN_ADDRESS, "PROXY_ADMIN_ADDRESS");
  const blrProxyAddress = validateOptionalAddress(process.env.BLR_PROXY, "BLR proxy");
  const factoryProxyAddress = validateOptionalAddress(process.env.FACTORY_PROXY, "Factory proxy");
  const deployNewBlrImpl = parseBooleanEnv("DEPLOY_NEW_BLR_IMPL", false);
  const deployNewFactoryImpl = parseBooleanEnv("DEPLOY_NEW_FACTORY_IMPL", false);
  const blrImplementationAddress = validateOptionalAddress(process.env.BLR_IMPLEMENTATION, "BLR implementation");
  const factoryImplementationAddress = validateOptionalAddress(
    process.env.FACTORY_IMPLEMENTATION,
    "Factory implementation",
  );
  const blrInitData = process.env.BLR_INIT_DATA;
  const factoryInitData = process.env.FACTORY_INIT_DATA;

  info(`🔄 Starting TUP Proxy Upgrade`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`🔑 ProxyAdmin: ${proxyAdminAddress}`);
  if (blrProxyAddress) {
    info(`  BLR Proxy: ${blrProxyAddress}`);
    info(`  Deploy: ${deployNewBlrImpl}, Implementation: ${blrImplementationAddress || "None"}`);
  }
  if (factoryProxyAddress) {
    info(`  Factory Proxy: ${factoryProxyAddress}`);
    info(`  Deploy: ${deployNewFactoryImpl}, Implementation: ${factoryImplementationAddress || "None"}`);
  }
  info("---");

  info(`👤 Deployer: ${address}`);

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

export { main };

if (require.main === module) {
  main().catch((err) => {
    error("❌ Fatal error:", err);
    process.exit(1);
  });
}
