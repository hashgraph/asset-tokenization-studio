// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import TransactionService from "@service/transaction/TransactionService";
import { ConnectCommand, ConnectCommandResponse } from "./ConnectCommand";
import { ConnectCommandError } from "./error/ConnectCommandError";

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
  async execute(command: ConnectCommand): Promise<ConnectCommandResponse> {
    try {
      const handler = TransactionService.getHandlerClass(command.wallet);
      const debug = command.debug ? command.debug : false;

      const input =
        command.custodialSettings === undefined
          ? command.HWCSettings === undefined
            ? command.account
            : command.HWCSettings
          : command.custodialSettings;

      const registration = await handler.register(input, debug);

      return Promise.resolve(new ConnectCommandResponse(registration, command.wallet));
    } catch (error) {
      throw new ConnectCommandError(error as Error);
    }
  }
}
