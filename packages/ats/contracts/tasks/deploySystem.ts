// SPDX-License-Identifier: Apache-2.0

/**
 * Hardhat task for deploying complete ATS system.
 *
 * Provides a Hardhat task interface to the new modular deployment system.
 *
 * Usage:
 * - npx hardhat deploy-system --network testnet
 * - npx hardhat deploy-system --network testnet --timetravel
 * - npx hardhat deploy-system --network testnet --output custom-deployment.json
 */

import { task } from "hardhat/config";
import { deploySystemWithNewBlr } from "../scripts/workflows/deploySystemWithNewBlr";

task("deploy-system", "Deploy complete ATS system using new modular scripts")
  .addFlag("timetravel", "Use TimeTravel variants for facets")
  .addOptionalParam("output", "Custom output file path for deployment data")
  .setAction(async (args, hre) => {
    console.log(`\n🎯 Deploying to network: ${hre.network.name}`);
    console.log(`🔄 TimeTravel: ${args.timetravel ? "Enabled" : "Disabled"}`);

    if (args.output) {
      console.log(`📄 Output: ${args.output}`);
    }

    try {
      const result = await deploySystemWithNewBlr(hre.network.name, {
        useTimeTravel: args.timetravel,
        saveOutput: true,
        outputPath: args.output,
      });

      console.log("\n📋 Deployment Summary:");
      console.log("─".repeat(60));
      console.log(`ProxyAdmin:     ${result.infrastructure.proxyAdmin.address}`);
      console.log(`BLR Proxy:      ${result.infrastructure.blr.proxy}`);
      console.log(`Factory Proxy:  ${result.infrastructure.factory.proxy}`);
      console.log(`Facets:         ${result.summary.totalFacets}`);
      console.log(`Configurations: ${result.summary.totalConfigurations}`);

      if (result.infrastructure.proxyAdmin.contractId) {
        console.log("\n🆔 Hedera Contract IDs:");
        console.log("─".repeat(60));
        console.log(`ProxyAdmin:     ${result.infrastructure.proxyAdmin.contractId}`);
        console.log(`BLR:            ${result.infrastructure.blr.contractId}`);
        console.log(`Factory:        ${result.infrastructure.factory.contractId}`);
      }

      console.log("─".repeat(60));

      return result;
    } catch (error) {
      console.error("\n❌ Deployment failed:", error);
      throw error;
    }
  });
