// SPDX-License-Identifier: Apache-2.0

import { BaseArgs as BaseRequest } from "@core/validation/BaseArgs";

export { BaseArgs as BaseRequest } from "@core/validation/BaseArgs";

export interface RequestAccount {
  accountId: string;
  privateKey?: RequestPrivateKey;
  publicKey?: RequestPublicKey;
  evmAddress?: string;
}

interface RequestKey {
  key: string;
  type?: string;
}

// Extend as empty interface for future changes
export interface RequestPublicKey extends RequestKey {}

export interface AccountBaseRequest {
  account: RequestAccount;
}

export interface ContractBaseRequest extends BaseRequest, AccountBaseRequest {
  proxyContractId: string;
}

export interface RequestPrivateKey extends RequestKey {
  type: string;
}
