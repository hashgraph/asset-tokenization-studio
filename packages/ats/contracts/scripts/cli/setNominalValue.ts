#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 *
 * @module cli/setNominalValue
 */

import { ethers } from "hardhat";
import { info, success, error } from "@scripts/infrastructure";
import { requireNetworkSigner } from "./shared";

// ============================================================================
// Main
// ============================================================================

async function main() {
  const { network, signer, address } = await requireNetworkSigner();

  const tokenEVMAddress = "0x3ef7C81Ec765466CFa7E4f985b063B4AfbC4A3f1";
  const nominalValue = 100;
  const nominalValueDecimals = 2;

  info(`🚀 Starting nominal value update`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`👤 Admin: ${address}`);
  info(`🏭 Token Address: ${tokenEVMAddress}`);
  info(`🔗 Nominal Value: ${nominalValue}`);
  info(`🔗 Nominal Value Decimals: ${nominalValueDecimals}`);
  info("---");

  try {
    let asset = await ethers.getContractAt("IAsset", tokenEVMAddress, signer);
    const response = await asset.setNominalValue(nominalValue, nominalValueDecimals);

    info("---");
    success("✅ Nominal Value updated successfully!");
    info(`📋Transaction hash: ${response.hash}`);
    info("---");
    process.exit(0);
  } catch (err) {
    error("❌ Nominal value set failed:", err);
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
