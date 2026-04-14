#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 *
 * @module cli/applyRoles
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

  const tokenEVMAddress = "0x75871f3e866C96d83672414f613068E935762323";
  const accountToApplyRolesTo = "0xD5BE4c50a2B499BdF20ce2722cc41d2c7F70CD3b";
  const rolesToGrant: string[] = [
    ATS_ROLES._DEFAULT_ADMIN_ROLE,
    ATS_ROLES._ISSUER_ROLE,
    ATS_ROLES._CONTROL_LIST_ROLE,
    ATS_ROLES._CONTROLLER_ROLE,
    ATS_ROLES._AGENT_ROLE,
    ATS_ROLES._CAP_ROLE,
    ATS_ROLES._FREEZE_MANAGER_ROLE,
    ATS_ROLES._KYC_ROLE,
    ATS_ROLES._PAUSER_ROLE,
    ATS_ROLES._TREX_OWNER_ROLE,
    ATS_ROLES._NOMINAL_VALUE_ROLE,
  ];
  const rolesToRevoke: string[] = [];

  info(`🚀 Starting applying Roles`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`👤 Admin: ${address}`);
  info(`🏭 Token Address: ${tokenEVMAddress}`);
  info(`🔗 Account to apply Roles to: ${accountToApplyRolesTo}`);
  info(`🪙 Roles to grant: ${rolesToGrant}`);
  info(`🪙 Roles to revoke: ${rolesToRevoke}`);
  info("---");

  const roles = [];
  const actives = [];

  for (let i = 0; i < rolesToGrant.length; i++) {
    roles.push(rolesToGrant[i]);
    actives.push(true);
  }

  for (let j = 0; j < rolesToRevoke.length; j++) {
    roles.push(rolesToRevoke[j]);
    actives.push(false);
  }

  try {
    let asset = await ethers.getContractAt("IAsset", tokenEVMAddress, signer);
    const response = await asset.applyRoles(roles, actives, accountToApplyRolesTo);

    info("---");
    success("✅ Roles applied successfully!");
    info(`📋Transaction hash: ${response.hash}`);
    info("---");
    process.exit(0);
  } catch (err) {
    error("❌ Role application failed:", err);
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
