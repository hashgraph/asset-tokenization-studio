// SPDX-License-Identifier: Apache-2.0

/* eslint-disable jest/no-mocks-import */
import { CommandBus } from "@core/command/CommandBus";
import { ConcreteCommand, ConcreteCommandResponse } from "./__mocks__/ConcreteCommandHandler";

const commandBus = new CommandBus();

describe("CommandHandler Test", () => {
  it("Executes a simple command successfully", async () => {
    const execSpy = jest.spyOn(commandBus, "execute");
    const command = new ConcreteCommand("1", 4);
    const res = await commandBus.execute(command);
    expect(res).toBeInstanceOf(ConcreteCommandResponse);
    expect(res.payload).toBe(command.payload);
    expect(execSpy).toHaveBeenCalled();
  });
});
