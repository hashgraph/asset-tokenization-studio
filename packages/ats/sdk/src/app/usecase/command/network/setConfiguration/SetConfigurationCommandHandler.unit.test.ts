// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { SetConfigurationCommandHandler } from "./SetConfigurationCommandHandler";
import { SetConfigurationCommand, SetConfigurationCommandResponse } from "./SetConfigurationCommand";
import NetworkService from "@service/network/NetworkService";
import { SetConfigurationCommandFixture } from "@test/fixtures/network/NetworkFixture";

describe("SetConfigurationCommandHandler", () => {
  let handler: SetConfigurationCommandHandler;
  let command: SetConfigurationCommand;

  const networkServiceMock = createMock<NetworkService>();

  beforeEach(() => {
    handler = new SetConfigurationCommandHandler(networkServiceMock);
    command = SetConfigurationCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully set configuration", async () => {
      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(SetConfigurationCommandResponse);
      expect(networkServiceMock.configuration.factoryAddress).toBe(command.factoryAddress);
      expect(networkServiceMock.configuration.resolverAddress).toBe(command.resolverAddress);
      expect(result.factoryAddress).toEqual(command.factoryAddress);
      expect(result.resolverAddress).toEqual(command.resolverAddress);
    });
  });
});
