#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 *
 * @module cli/grantRole
 */

import { ethers } from "hardhat";
import { info, success, error } from "@scripts/infrastructure";
import { requireNetworkSigner } from "./shared";
import { ATS_ROLES } from "@scripts";

// ============================================================================
// Main
// ============================================================================

async function main() {
  const { network, signer, address } = await requireNetworkSigner();

  const tokenEVMAddress = "0x1F4ca0570AFaED33E68c4e7f0278326E4B184C5A";
  const accountToGrantRoleTo = "0xDFdB83D90c9611adA2794052D214365EA0EbC7D2";
  const roleToGrant = ATS_ROLES._NOMINAL_VALUE_ROLE;

  info(`🚀 Starting granting Role`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`👤 Admin: ${address}`);
  info(`🏭 Token Address: ${tokenEVMAddress}`);
  info(`🔗 Account to grant Role to: ${accountToGrantRoleTo}`);
  info(`🪙 Role to grant: ${roleToGrant}`);
  info("---");

  try {
    let asset = await ethers.getContractAt("IAsset", tokenEVMAddress, signer);
    const response = await asset.grantRole(roleToGrant, accountToGrantRoleTo);

    info("---");
    success("✅ Role granted successfully!");
    info(`📋Transaction hash: ${response.hash}`);
    info("---");
    process.exit(0);
  } catch (err) {
    error("❌ Role grant failed:", err);
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
