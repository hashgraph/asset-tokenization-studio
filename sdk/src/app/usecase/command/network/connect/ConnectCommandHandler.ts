import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import TransactionService from '../../../../service/TransactionService.js';
import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
  async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
    const handler = TransactionService.getHandlerClass();
    const debug = command.debug ? command.debug : false;
    const registration = await handler.register(command.account, debug);

    return Promise.resolve(
      new ConnectCommandResponse(registration, command.wallet),
    );
  }
}
