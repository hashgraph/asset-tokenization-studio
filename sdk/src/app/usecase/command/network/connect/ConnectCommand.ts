import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import Account from '../../../../../domain/context/account/Account.js';
import { Environment } from '../../../../../domain/context/network/Environment.js';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet.js';
import { InitializationData } from '../../../../../port/out/TransactionAdapter.js';
import HWCSettings from "../../../../../domain/context/walletConnect/HWCSettings";

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
  ) {
    super();
  }
}
