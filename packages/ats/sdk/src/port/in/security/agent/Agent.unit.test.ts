// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { AddAgentRequest, RemoveAgentRequest } from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { AddAgentCommand } from "@command/security/operations/agent/addAgent/AddAgentCommand";
import { RemoveAgentCommand } from "@command/security/operations/agent/removeAgent/RemoveAgentCommand";
import { AddAgentRequestFixture, RemoveAgentRequestFixture } from "@test/fixtures/agent/AgentFixture";

describe("Agent", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let addAgentRequest: AddAgentRequest;
  let removeAgentRequest: RemoveAgentRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    mirrorNodeMock = createMock<MirrorNodeAdapter>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (Security as any).commandBus = commandBusMock;
    (Security as any).queryBus = queryBusMock;
    (Security as any).mirrorNode = mirrorNodeMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("AddAgentRequest", () => {
    addAgentRequest = new AddAgentRequest(AddAgentRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should add agent successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.addAgent(addAgentRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("AddAgentRequest", addAgentRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddAgentCommand(addAgentRequest.securityId, addAgentRequest.agentId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.addAgent(addAgentRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("AddAgentRequest", addAgentRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddAgentCommand(addAgentRequest.securityId, addAgentRequest.agentId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      addAgentRequest = new AddAgentRequest({
        ...AddAgentRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.addAgent(addAgentRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if agentId is invalid", async () => {
      addAgentRequest = new AddAgentRequest({
        ...AddAgentRequestFixture.create({
          agentId: "invalid",
        }),
      });

      await expect(Security.addAgent(addAgentRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("RemoveAgentRequest", () => {
    removeAgentRequest = new RemoveAgentRequest(RemoveAgentRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should add agent successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.removeAgent(removeAgentRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RemoveAgentRequest", removeAgentRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveAgentCommand(removeAgentRequest.securityId, removeAgentRequest.agentId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.removeAgent(removeAgentRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("RemoveAgentRequest", removeAgentRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveAgentCommand(removeAgentRequest.securityId, removeAgentRequest.agentId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      removeAgentRequest = new RemoveAgentRequest({
        ...RemoveAgentRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.removeAgent(removeAgentRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if agentId is invalid", async () => {
      removeAgentRequest = new RemoveAgentRequest({
        ...RemoveAgentRequestFixture.create({
          agentId: "invalid",
        }),
      });

      await expect(Security.removeAgent(removeAgentRequest)).rejects.toThrow(ValidationError);
    });
  });
});
