// SPDX-License-Identifier: Apache-2.0

import { OptionalField } from "@core/decorator/OptionalDecorator";
import { Environment } from "@domain/network/Environment";
import { MirrorNode } from "@domain/network/MirrorNode";
import { JsonRpcRelay } from "@domain/network/JsonRpcRelay";
import { SupportedWallets } from "@domain/network/Wallet";
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

export type CustodialSettings = DFNSConfigRequest;

export default class ConnectRequest extends ValidatedRequest<ConnectRequest> implements BaseRequest {
  @OptionalField()
  account?: RequestAccount;

  network: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  wallet: SupportedWallets;
  custodialWalletSettings?: CustodialSettings;

  constructor({
    account,
    network,
    mirrorNode,
    rpcNode,
    wallet,
    custodialWalletSettings,
  }: {
    account?: RequestAccount;
    network: Environment;
    mirrorNode: MirrorNode;
    rpcNode: JsonRpcRelay;
    wallet: SupportedWallets;
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
    this.custodialWalletSettings = custodialWalletSettings;
  }

  [n: string]: any;
}
