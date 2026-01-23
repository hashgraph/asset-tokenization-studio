// SPDX-License-Identifier: Apache-2.0

import {
  AWSKMSConfigRequest,
  DFNSConfigRequest,
  FireblocksConfigRequest,
} from "@port/in/request/network/ConnectRequest";
import Account from "@domain/context/account/Account";
import PrivateKey from "@domain/context/account/PrivateKey";
import PublicKey from "@domain/context/account/PublicKey";
import { HederaId } from "@domain/context/shared/HederaId";
import { config } from "dotenv";

config();

export const ENVIRONMENT = "testnet";
export const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS ?? "";
export const RESOLVER_ADDRESS = process.env.RESOLVER_ADDRESS ?? "";

export const CLIENT_PRIVATE_KEY_ECDSA = new PrivateKey({
  key: process.env.CLIENT_PRIVATE_KEY_ECDSA_1 ?? "",
  type: "ECDSA",
});
export const CLIENT_PUBLIC_KEY_ECDSA = new PublicKey({
  key: process.env.CLIENT_PUBLIC_KEY_ECDSA_1 ?? "",
  type: "ECDSA",
});
export const CLIENT_EVM_ADDRESS_ECDSA = process.env.CLIENT_EVM_ADDRESS_ECDSA_1 ?? "";
export const CLIENT_ACCOUNT_ID_ECDSA = process.env.CLIENT_ACCOUNT_ID_ECDSA_1 ?? "";
export const CLIENT_ACCOUNT_ECDSA: Account = new Account({
  id: CLIENT_ACCOUNT_ID_ECDSA,
  evmAddress: CLIENT_EVM_ADDRESS_ECDSA,
  privateKey: CLIENT_PRIVATE_KEY_ECDSA,
  publicKey: CLIENT_PUBLIC_KEY_ECDSA,
});
export const HEDERA_ID_ACCOUNT_ECDSA = HederaId.from(CLIENT_ACCOUNT_ID_ECDSA);

// DEMO ACCOUNTs

// Account Z
export const CLIENT_PRIVATE_KEY_ECDSA_Z = new PrivateKey({
  key: process.env.CLIENT_PRIVATE_KEY_ECDSA_1 ?? "",
  type: "ECDSA",
});
export const CLIENT_PUBLIC_KEY_ECDSA_Z = new PublicKey({
  key: process.env.CLIENT_PUBLIC_KEY_ECDSA_1 ?? "",
  type: "ECDSA",
});
export const CLIENT_EVM_ADDRESS_ECDSA_Z = process.env.CLIENT_EVM_ADDRESS_ECDSA_1 ?? "";
export const CLIENT_ACCOUNT_ID_ECDSA_Z = process.env.CLIENT_ACCOUNT_ID_ECDSA_1 ?? "";
export const CLIENT_ACCOUNT_ECDSA_Z: Account = new Account({
  id: CLIENT_ACCOUNT_ID_ECDSA_Z,
  evmAddress: CLIENT_EVM_ADDRESS_ECDSA_Z,
  privateKey: CLIENT_PRIVATE_KEY_ECDSA_Z,
  publicKey: CLIENT_PUBLIC_KEY_ECDSA_Z,
});
export const HEDERA_ID_ACCOUNT_ECDSA_Z = HederaId.from(CLIENT_ACCOUNT_ID_ECDSA_Z);

// Account A
export const CLIENT_PRIVATE_KEY_ECDSA_A = new PrivateKey({
  key: process.env.CLIENT_PRIVATE_KEY_ECDSA_2 ?? "",
  type: "ECDSA",
});
export const CLIENT_PUBLIC_KEY_ECDSA_A = new PublicKey({
  key: process.env.CLIENT_PUBLIC_KEY_ECDSA_2 ?? "",
  type: "ECDSA",
});
export const CLIENT_EVM_ADDRESS_ECDSA_A = process.env.CLIENT_EVM_ADDRESS_ECDSA_2 ?? "";
export const CLIENT_ACCOUNT_ID_ECDSA_A = process.env.CLIENT_ACCOUNT_ID_ECDSA_2 ?? "";
export const CLIENT_EVM_ADDRESS_ECDSA_1_CORRECT = process.env.CLIENT_EVM_ADDRESS_ECDSA_1_CORRECT ?? "";
export const CLIENT_ACCOUNT_ECDSA_A: Account = new Account({
  id: CLIENT_ACCOUNT_ID_ECDSA_A,
  evmAddress: CLIENT_EVM_ADDRESS_ECDSA_A,
  privateKey: CLIENT_PRIVATE_KEY_ECDSA_A,
  publicKey: CLIENT_PUBLIC_KEY_ECDSA_A,
});
export const HEDERA_ID_ACCOUNT_ECDSA_A = HederaId.from(CLIENT_ACCOUNT_ID_ECDSA_A);

export const DECIMALS = 2;

export const DFNS_SETTINGS: DFNSConfigRequest = {
  authorizationToken: process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN ?? "",
  credentialId: process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID ?? "",
  serviceAccountPrivateKey: process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH ?? "",
  urlApplicationOrigin: process.env.DFNS_APP_ORIGIN ?? "",
  applicationId: process.env.DFNS_APP_ID ?? "",
  baseUrl: process.env.DFNS_BASE_URL ?? "",
  walletId: process.env.DFNS_WALLET_ID ?? "",
  hederaAccountId: process.env.DFNS_HEDERA_ACCOUNT_ID ?? "",
  publicKey: process.env.DFNS_WALLET_PUBLIC_KEY ?? "",
};

export const FIREBLOCKS_SETTINGS: FireblocksConfigRequest = {
  apiKey: process.env.FIREBLOCKS_API_KEY ?? "",
  apiSecretKey: process.env.FIREBLOCKS_API_SECRET_KEY_PATH ?? "",
  baseUrl: process.env.FIREBLOCKS_BASE_URL ?? "",
  vaultAccountId: process.env.FIREBLOCKS_VAULT_ACCOUNT_ID ?? "",
  assetId: process.env.FIREBLOCKS_ASSET_ID ?? "",
  hederaAccountId: process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID ?? "",
};

export const AWS_KMS_SETTINGS: AWSKMSConfigRequest = {
  awsAccessKeyId: process.env.AWS_KMS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_KMS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_KMS_REGION ?? "",
  awsKmsKeyId: process.env.AWS_KMS_KEY_ID ?? "",
  hederaAccountId: process.env.AWS_KMS_HEDERA_ACCOUNT_ID ?? "",
};
