import { type Pause, type AccessControl } from "@contract-types";
import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";

export async function grantRoleAndPauseToken(
  accessControlFacet: AccessControl,
  pauseFacet: Pause,
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

// Add to CHAI API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertObject(actual: any, expected: any, path = ""): void {
  Object.keys(expected).forEach((key) => {
    const actualValue = actual[key];
    const expectedValue = expected[key];

    if (typeof actualValue === "object" && typeof expectedValue === "object") {
      if (Array.isArray(actualValue) && Array.isArray(expectedValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actualValue.forEach((item: any, index: number) => {
          assertObject(item, expectedValue[index], key);
        });
      } else {
        assertObject(actualValue, expectedValue, key);
      }
    } else {
      const pathError = path === "" ? key : `${path}.${key}`;
      expect(actualValue).to.equal(expectedValue, `Found error on ${pathError}`);
    }
  });
}

export async function getDltTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock("latest");
  if (!block) {
    throw new Error("Failed to get latest block");
  }
  return block.timestamp;
}
