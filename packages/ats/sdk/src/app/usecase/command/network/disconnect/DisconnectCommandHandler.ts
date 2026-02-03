// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import Injectable from "@core/injectable/Injectable";
import { DisconnectCommand, DisconnectCommandResponse } from "./DisconnectCommand";
import { DisconnectCommandError } from "./error/DisconnectCommandError";

@CommandHandler(DisconnectCommand)
export class DisconnectCommandHandler implements ICommandHandler<DisconnectCommand> {
  async execute(): Promise<DisconnectCommandResponse> {
    try {
      const handler = Injectable.resolveTransactionHandler();
      const res = await handler.stop();
      return new DisconnectCommandResponse(res);
    } catch (error) {
      throw new DisconnectCommandError(error as Error);
    }
  }
}
