// SPDX-License-Identifier: Apache-2.0

import type { IAssetMock } from "@contract-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { EMPTY_STRING, ZERO } from "@scripts";
import { MAX_UINT256 } from "@test";

export async function grantKycToHolders(
  asset: IAssetMock,
  kycSigner: HardhatEthersSigner,
  holders: (HardhatEthersSigner | string)[],
  issuer?: string,
): Promise<void> {
  for (const holder of holders) {
    const holderAddress = typeof holder === "string" ? holder : holder.address;
    await asset
      .connect(kycSigner)
      .grantKyc(holderAddress, EMPTY_STRING, ZERO, MAX_UINT256, issuer ?? kycSigner.address);
  }
}
