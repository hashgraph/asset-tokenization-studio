// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from "@core/command/Command";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandResponse } from "@core/command/CommandResponse";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";

export class ConcreteCommandResponse implements CommandResponse {
  constructor(public readonly payload: number) {}
}

export class ConcreteCommand extends Command<ConcreteCommandResponse> {
  constructor(
    public readonly itemId: string,
    public readonly payload: number,
  ) {
    super();
  }
}

export class ConcreteCommandRepository {
  public map = new Map<ConcreteCommand, any>();
}

@CommandHandler(ConcreteCommand)
export class ConcreteCommandHandler implements ICommandHandler<ConcreteCommand> {
  constructor(private readonly repo: ConcreteCommandRepository = new ConcreteCommandRepository()) {}

  execute(command: ConcreteCommand): Promise<ConcreteCommandResponse> {
    this.repo.map.set(command, "Hello world");
    return Promise.resolve(new ConcreteCommandResponse(command.payload));
  }
}
