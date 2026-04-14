#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 *
 * @module cli/revokeRole
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
  const accountToRevokeRoleFrom = "0xc58DE1d126426cF75a046317aD7338F083bb782a";
  const roleToRevoke = ATS_ROLES._ISSUER_ROLE;

  info(`🚀 Starting revoking Role`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`👤 Admin: ${address}`);
  info(`🏭 Token Address: ${tokenEVMAddress}`);
  info(`🔗 Account to revoke Role from: ${accountToRevokeRoleFrom}`);
  info(`🪙 Role to revoke: ${roleToRevoke}`);
  info("---");

  try {
    let asset = await ethers.getContractAt("IAsset", tokenEVMAddress, signer);
    const response = await asset.revokeRole(roleToRevoke, accountToRevokeRoleFrom);

    info("---");
    success("✅ Role revoked successfully!");
    info(`📋Transaction hash: ${response.hash}`);
    info("---");
    process.exit(0);
  } catch (err) {
    error("❌ Role revoke failed:", err);
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
