// SPDX-License-Identifier: Apache-2.0

import { subtask, task, types } from "hardhat/config";
import { Signer, Wallet } from "ethers";
import { ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import { GetSignerResult, GetSignerArgs, Keccak256Args, CreateVcArgs } from "@tasks";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { createEcdsaCredential, EthrDID } from "@terminal3/ecdsa_vc";
import { DID, type VerificationOptions } from "@terminal3/vc_core";
import * as path from "node:path";
import * as fs from "node:fs";

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

    let signer: Signer | SignerWithAddress = signers[0];
    if (privateKey) {
      signer = new Wallet(privateKey, hre.ethers.provider);
    } else if (signerPosition) {
      signer = signers[signerPosition];
    } else if (signerAddress) {
      signer =
        signers.find((signer) => {
          return keccak256(signer.address) === keccak256(signerAddress);
        }) ?? signers[0];
    }

    return {
      signer,
      address: await signer.getAddress(),
      privateKey: privateKey,
    } as GetSignerResult;
  });

task("keccak256", "Prints the keccak256 hash of a string")
  .addPositionalParam("input", "The string to be hashed", undefined, types.string)
  .setAction(async ({ input }: Keccak256Args) => {
    const hash = keccak256(Buffer.from(input, "utf-8"));
    console.log(`The keccak256 hash of the input "${input}" is: ${hash}`);
  });

task("createVC", "Generates a .vc file for a given issuer and holder")
  .addOptionalParam("holder", "The address to which the VC is granted", undefined, types.string)
  .addOptionalParam("privatekey", "The hexadecimal private key from the issuer of the VC", undefined, types.string)
  .setAction(async (args: CreateVcArgs) => {
    const issuer = new EthrDID(args.privatekey, "polygon");
    const holderDid = new DID("ethr", args.holder);

    // Creating a credential with BBS+ signature
    const claims = { kyc: "passed" };
    const revocationRegistryAddress = "0x77Fb69B24e4C659CE03fB129c19Ad591374C349e";
    const didRegistryAddress = "0x312C15922c22B60f5557bAa1A85F2CdA4891C39a";
    const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");

    const options = {
      revocationRegistryAddress,
      provider,
      didRegistryAddress,
    } as unknown as VerificationOptions;

    const vc = await createEcdsaCredential(issuer, holderDid, claims, ["KycCredential"], undefined, undefined, options);

    const vcString = JSON.stringify(vc, null, 2);

    const safeHolder = (args.holder ?? "unknown").toLowerCase().replace(/^0x/, "");
    const fileName = `vc_${safeHolder}_${Date.now()}.vc`;
    const filePath = path.resolve(process.cwd(), fileName);
    fs.writeFileSync(filePath, vcString, "utf8");

    console.log(`VC generated in: ${filePath}`);
  });

task("extract-methods", "Extracts all public and external function signatures from contracts").setAction(async () => {
  try {
    const { main } = await import("@scripts");
    // Redirect output so it is not logged
    const originalConsoleLog = console.log;
    console.log = () => {};
    try {
      main(); // ! Called when importing the script directly
    } finally {
      console.log = originalConsoleLog;
    }
  } catch (error) {
    console.error("❌ An error occurred while extracting methods:");
    console.error(error);
  }
});
