import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import TransactionService from '../../../../service/TransactionService.js';
import { ConnectCommand, ConnectCommandResponse } from './ConnectCommand.js';

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
  async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
    console.log('Connect Command : ' + JSON.stringify(command));
    const handler = TransactionService.getHandlerClass(command.wallet);
    console.log('ConnectCommandHandler', handler);
    const debug = command.debug ? command.debug : false;
    const registration = await handler.register(
      command.wcSettings,
      command.account,
      debug,
    );

    return Promise.resolve(
      new ConnectCommandResponse(registration, command.wallet),
    );
  }
}
