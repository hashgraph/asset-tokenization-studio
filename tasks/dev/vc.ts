// SPDX-License-Identifier: Apache-2.0

import { task, types } from "hardhat/config";
import { ethers } from "ethers";
import { createEcdsaCredential, EthrDID } from "@terminal3/ecdsa_vc";
import { DID, type VerificationOptions } from "@terminal3/vc_core";
import * as path from "node:path";
import * as fs from "node:fs";

interface CreateVcArgs {
  holder: string;
  privatekey: string;
}

task("createVC", "Generates a .vc file for a given issuer and holder")
  .addOptionalParam("holder", "The address to which the VC is granted", undefined, types.string)
  .addOptionalParam("privatekey", "The hexadecimal private key from the issuer of the VC", undefined, types.string)
  .setAction(async (args: CreateVcArgs) => {
    const issuer = new EthrDID(args.privatekey, "polygon");
    const holderDid = new DID("ethr", args.holder);

    const claims = { kyc: "passed" };
    const revocationRegistryAddress = "0x77Fb69B24e4C659CE03fB129c19Ad591374C349e";
    const didRegistryAddress = "0x312C15922c22B60f5557bAa1A85F2CdA4891C39a";
    const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");

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
