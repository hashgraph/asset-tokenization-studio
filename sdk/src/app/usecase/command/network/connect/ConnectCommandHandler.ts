import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import TransactionService from '../../../../service/TransactionService.js';
import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
  async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
    const handler = TransactionService.getHandlerClass(command.wallet);
    const debug = command.debug ? command.debug : false;

    const input = command.HWCSettings ? command.HWCSettings : command.account;

    const registration = await handler.register(input, debug);

    return Promise.resolve(
      new ConnectCommandResponse(registration, command.wallet),
    );
  }
}
