// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import Account from "@domain/context/account/Account";
import { Environment } from "@domain/context/network/Environment";
import { SupportedWallets } from "@domain/context/network/Wallet";
import { InitializationData } from "@port/out/TransactionAdapter";
import HWCSettings from "@core/settings/walletConnect/HWCSettings";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";
import FireblocksSettings from "@core/settings/custodialWalletSettings/FireblocksSettings";
import AWSKMSSettings from "@core/settings/custodialWalletSettings/AWSKMSSettings";

export class ConnectCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: InitializationData,
    public readonly walletType: SupportedWallets,
  ) {}
}

export class ConnectCommand extends Command<ConnectCommandResponse> {
  constructor(
    public readonly environment: Environment,
    public readonly wallet: SupportedWallets,
    public readonly account?: Account,
    public readonly HWCSettings?: HWCSettings,
    public readonly debug?: boolean,
    public readonly custodialSettings?: DfnsSettings | FireblocksSettings | AWSKMSSettings,
  ) {
    super();
  }
}
