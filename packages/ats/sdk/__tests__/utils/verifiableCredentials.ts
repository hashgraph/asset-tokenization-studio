// SPDX-License-Identifier: Apache-2.0

import { ethers } from "ethers";
import { createEcdsaCredential, EthrDID } from "@terminal3/ecdsa_vc";
import { DID, type VerificationOptions } from "@terminal3/vc_core";
import PrivateKey from "@domain/context/account/PrivateKey";
import { CLIENT_ACCOUNT_ECDSA } from "../config";

async function createVcT3(address: string): Promise<string> {
  const issuerPrivateKey = CLIENT_ACCOUNT_ECDSA.privateKey as PrivateKey;
  const issuer = new EthrDID(issuerPrivateKey.key as string, "polygon");
  const holderDid = new DID("ethr", address);

  // Creating a credential with BBS+ signature
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

  const vcString = JSON.stringify(vc);
  const vcBase64 = Buffer.from(vcString).toString("base64");

  return vcBase64;
}

export default createVcT3;
