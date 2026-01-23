// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { PauseRequest } from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { PauseRequestFixture } from "@test/fixtures/pause/PauseFixture";
import { PauseCommand } from "@command/security/operations/pause/PauseCommand";
import { IsPausedQuery } from "@query/security/isPaused/IsPausedQuery";

describe("Pause", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

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

  describe("pause", () => {
    const pauseRequest = new PauseRequest(PauseRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should pause successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.pause(pauseRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("PauseRequest", pauseRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(new PauseCommand(pauseRequest.securityId));
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.pause(pauseRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("PauseRequest", pauseRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(new PauseCommand(pauseRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      const pauseRequest = new PauseRequest({
        ...PauseRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.pause(pauseRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("unpause", () => {
    const pauseRequest = new PauseRequest(PauseRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should unpause successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.unpause(pauseRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("PauseRequest", pauseRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(new PauseCommand(pauseRequest.securityId));
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.unpause(pauseRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("PauseRequest", pauseRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(new PauseCommand(pauseRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      const pauseRequest = new PauseRequest({
        ...PauseRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.unpause(pauseRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("isPaused", () => {
    const pauseRequest = new PauseRequest(PauseRequestFixture.create());

    const expectedResponse = {
      payload: true,
    };
    it("should isPaused successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.isPaused(pauseRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("PauseRequest", pauseRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsPausedQuery(pauseRequest.securityId));
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.isPaused(pauseRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("PauseRequest", pauseRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsPausedQuery(pauseRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      const pauseRequest = new PauseRequest({
        ...PauseRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.isPaused(pauseRequest)).rejects.toThrow(ValidationError);
    });
  });
});
