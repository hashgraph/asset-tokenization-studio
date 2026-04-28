// SPDX-License-Identifier: Apache-2.0

import { type IAsset } from "@contract-types";
import { Signer } from "ethers";
import { ethers } from "hardhat";

export async function grantRoleAndPauseToken(
  accessControlFacet: IAsset,
  pauseFacet: IAsset,
  role: string,
  signerAccessControl: Signer,
  signerPause: Signer,
  accountToAssignRole: string,
) {
  // Granting Role to account
  await accessControlFacet.connect(signerAccessControl).grantRole(role, accountToAssignRole);
  // Pausing the token
  await pauseFacet.connect(signerPause).pause();
}

export async function getDltTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock("latest");
  if (!block) {
    throw new Error("Failed to get latest block");
  }
  return block.timestamp;
}
