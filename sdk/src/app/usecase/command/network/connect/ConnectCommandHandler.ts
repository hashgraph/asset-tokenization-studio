import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import TransactionService from '../../../../service/TransactionService.js';
import LogService from '../../../../../app/service/LogService.js';
import Account from '../../../../../domain/context/account/Account.js';
import WalletConnectSettings from '../../../../../domain/context/walletConnect/WalletConnectSettings.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
  async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
    LogService.logTrace('ConnectCommandHandler', 'execute', command);
    const handler = TransactionService.getHandlerClass(command.wallet);

    let input: Account | undefined | WalletConnectSettings;
    if (!command.wcSettings) {
      input = command.account;
    } else {
      input = command.wcSettings;
    }

    const registration = await handler.register(input);

    return new ConnectCommandResponse(registration, command.wallet);
  }
}
