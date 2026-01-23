// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Inject } from "@nestjs/common";
import { COMMAND_HANDLER_METADATA, COMMAND_METADATA, TOKENS } from "../Constants";
import { CommandMetadata } from "../decorator/CommandMetadata";
import { Type } from "../Type";
import { Command } from "./Command";
import { ICommandHandler } from "./CommandHandler";
import { CommandResponse } from "./CommandResponse";
import { CommandHandlerNotFoundException } from "./error/CommandHandlerNotFoundException";
import { InvalidCommandHandlerException } from "./error/InvalidCommandHandlerException";

export type CommandHandlerType = ICommandHandler<Command<CommandResponse>>;

export interface ICommandBus<T extends CommandResponse> {
  execute<X extends T>(command: Command<X>): Promise<X>;
  bind<X extends T>(handler: ICommandHandler<Command<X>>, id: string): void;
}

@Injectable()
export class CommandBus<T extends CommandResponse = CommandResponse> implements ICommandBus<T> {
  public handlers = new Map<string, ICommandHandler<Command<T>>>();

  constructor(
    @Inject(TOKENS.COMMAND_HANDLER)
    private readonly providedHandlers: ICommandHandler<any>[],
  ) {
    this.registerHandlers(providedHandlers);
  }

  execute<X extends T>(command: Command<X>): Promise<X> {
    const commandId = this.getCommandId(command);
    const handler = this.handlers.get(commandId);
    if (!handler) {
      throw new CommandHandlerNotFoundException(commandId);
    }
    // Has to be casted to return type as it its inferred based off the parameter
    return handler.execute(command) as Promise<X>;
  }

  bind<X extends T>(handler: ICommandHandler<Command<X>>, id: string): void {
    this.handlers.set(id, handler);
  }

  private getCommandId<X>(command: Command<X>): string {
    const { constructor: commandType } = Object.getPrototypeOf(command);
    const commandMetadata: CommandMetadata = Reflect.getMetadata(COMMAND_METADATA, commandType);
    if (!commandMetadata) {
      throw new CommandHandlerNotFoundException(commandType.name);
    }
    return commandMetadata.id;
  }

  protected registerHandlers(handlers: CommandHandlerType[]): void {
    handlers.forEach((handler) => {
      const target = this.reflectCommandId(handler);
      if (!target) {
        throw new InvalidCommandHandlerException();
      }
      this.bind(handler as ICommandHandler<Command<T>>, target);
    });
  }

  private reflectCommandId(handler: CommandHandlerType): string | undefined {
    const { constructor: handlerType } = Object.getPrototypeOf(handler);
    const command: Type<Command<CommandResponse>> = Reflect.getMetadata(COMMAND_HANDLER_METADATA, handlerType);
    const commandMetadata: CommandMetadata = Reflect.getMetadata(COMMAND_METADATA, command);
    return commandMetadata.id;
  }
}
