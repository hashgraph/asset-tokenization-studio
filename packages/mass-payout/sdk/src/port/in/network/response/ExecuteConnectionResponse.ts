// SPDX-License-Identifier: Apache-2.0

import { SupportedWallets } from "@domain/network/Wallet";
import { InitializationData } from "@port/out/TransactionAdapter";

export default class ExecuteConnectionResponse {
  constructor(
    public readonly payload: InitializationData,
    public readonly walletType: SupportedWallets,
  ) {}
}
