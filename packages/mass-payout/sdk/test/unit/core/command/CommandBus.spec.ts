// SPDX-License-Identifier: Apache-2.0

import "reflect-metadata";
import { CommandBus } from "@core/command/CommandBus";
import { Command } from "@core/command/Command";
import { ICommandHandler } from "@core/command/CommandHandler";
import { COMMAND_METADATA, COMMAND_HANDLER_METADATA } from "@core/Constants";

class DummyResponse {}
class DummyCommand extends Command<DummyResponse> {}
Reflect.defineMetadata(COMMAND_METADATA, { id: "DUMMY_COMMAND" }, DummyCommand);

// Dummy handler
class DummyHandler implements ICommandHandler<Command<DummyResponse>> {
  execute = jest.fn().mockResolvedValue(new DummyResponse());
}
Reflect.defineMetadata(COMMAND_HANDLER_METADATA, DummyCommand, DummyHandler);

describe("CommandBus", () => {
  let bus: CommandBus<DummyResponse>;
  let handler: DummyHandler;

  beforeEach(() => {
    handler = new DummyHandler();
    // Inject the handler
    bus = new CommandBus<DummyResponse>([handler]);
  });

  it("should execute command with registered handler", async () => {
    const command = new DummyCommand();
    const result = await bus.execute(command);

    expect(result).toBeInstanceOf(DummyResponse);
    expect(handler.execute).toHaveBeenCalledWith(command);
  });

  it("should bind a new handler dynamically", async () => {
    class NewCommand extends Command<DummyResponse> {}
    Reflect.defineMetadata(COMMAND_METADATA, { id: "NEW_COMMAND" }, NewCommand);

    const newHandler = {
      execute: jest.fn().mockResolvedValue(new DummyResponse()),
    };
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, NewCommand, newHandler);

    bus.bind(newHandler as any, "NEW_COMMAND");

    const command = new NewCommand();
    const result = await bus.execute(command);

    expect(result).toBeInstanceOf(DummyResponse);
    expect(newHandler.execute).toHaveBeenCalledWith(command);
  });
});
