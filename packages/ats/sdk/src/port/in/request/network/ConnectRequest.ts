// SPDX-License-Identifier: Apache-2.0

import { OptionalField } from "@core/decorator/OptionalDecorator";
import { Environment } from "@domain/context/network/Environment";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import { SupportedWallets } from "@domain/context/network/Wallet";
import { BaseRequest, RequestAccount } from "../BaseRequest";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export { SupportedWallets };

export interface DFNSConfigRequest {
  authorizationToken: string;
  credentialId: string;
  serviceAccountPrivateKey: string;
  urlApplicationOrigin: string;
  applicationId: string;
  baseUrl: string;
  walletId: string;
  hederaAccountId: string;
  publicKey: string;
}

export interface FireblocksConfigRequest {
  apiSecretKey: string;
  apiKey: string;
  baseUrl: string;
  vaultAccountId: string;
  assetId: string;
  hederaAccountId: string;
}

export interface AWSKMSConfigRequest {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  awsKmsKeyId: string;
  hederaAccountId: string;
}

export type CustodialSettings = DFNSConfigRequest | FireblocksConfigRequest | AWSKMSConfigRequest;

export type HWCRequestSettings = {
  projectId: string;
  dappName: string;
  dappDescription: string;
  dappURL: string;
  dappIcons: string[];
};

export default class ConnectRequest extends ValidatedRequest<ConnectRequest> implements BaseRequest {
  @OptionalField()
  account?: RequestAccount;
  network: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  wallet: SupportedWallets;
  hwcSettings?: HWCRequestSettings;
  debug?: boolean;
  custodialWalletSettings?: CustodialSettings;

  constructor({
    account,
    network,
    mirrorNode,
    rpcNode,
    wallet,
    hwcSettings,
    debug,
    custodialWalletSettings,
  }: {
    account?: RequestAccount;
    network: Environment;
    mirrorNode: MirrorNode;
    rpcNode: JsonRpcRelay;
    wallet: SupportedWallets;
    hwcSettings?: HWCRequestSettings;
    debug?: boolean;
    custodialWalletSettings?: CustodialSettings;
  }) {
    super({
      account: FormatValidation.checkAccount(),
      wallet: FormatValidation.checkString({ emptyCheck: true }),
    });
    this.account = account;
    this.network = network;
    this.mirrorNode = mirrorNode;
    this.rpcNode = rpcNode;
    this.wallet = wallet;
    this.debug = debug;
    this.hwcSettings = hwcSettings;
    this.custodialWalletSettings = custodialWalletSettings;
  }

  // eslint-disable-next-line no-undef, @typescript-eslint/no-explicit-any
  [key: string]: any;
}
