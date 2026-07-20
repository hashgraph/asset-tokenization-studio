// SPDX-License-Identifier: Apache-2.0

/**
 * Shared signer resolution for every write task.
 *
 * `getSigner` is a Hardhat subtask (invoked with `hre.run("getSigner", ...)`),
 * so ops tasks never touch `process.env` or build wallets themselves.
 */

import { subtask, types } from "hardhat/config";
import { getAddress, Signer, Wallet } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

export interface GetSignerResult {
  signer: HardhatEthersSigner;
  address: string;
  /** Only set when the signer was built from `--private-key`. */
  privateKey?: string;
}

/** Mixin of the three optional signer-selection params shared by write tasks. */
export interface GetSignerArgs {
  privateKey?: string;
  signerAddress?: string;
  signerPosition?: number;
}

subtask("getSigner", "Retrieve the signer for deployment. Defaults to the primary signer if none is specified")
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: GetSignerArgs, hre) => {
    console.log(`Executing getSigner on ${hre.network.name} ...`);
    const { privateKey, signerAddress, signerPosition } = args;
    const signers = await hre.ethers.getSigners();

    let signer: Signer | HardhatEthersSigner = signers[0];
    if (privateKey) {
      signer = new Wallet(privateKey, hre.ethers.provider);
    } else if (signerPosition) {
      signer = signers[signerPosition];
    } else if (signerAddress) {
      // Normalize both sides: a lowercase vs checksummed mismatch must never
      // fall back to the default signer silently.
      const wanted = getAddress(signerAddress);
      const found = signers.find((candidate) => getAddress(candidate.address) === wanted);
      if (found === undefined) {
        throw new Error(`No configured signer with address ${wanted} on network ${hre.network.name}`);
      }
      signer = found;
    }

    return {
      signer,
      address: await signer.getAddress(),
      privateKey: privateKey,
    } as GetSignerResult;
  });
