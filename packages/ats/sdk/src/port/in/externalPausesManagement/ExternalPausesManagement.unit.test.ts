// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ExternalPausesManagement from "./ExternalPausesManagement";
import {
  AddExternalPauseRequest,
  GetExternalPausesCountRequest,
  GetExternalPausesMembersRequest,
  IsExternalPauseRequest,
  IsPausedMockRequest,
  RemoveExternalPauseRequest,
  SetPausedMockRequest,
  UpdateExternalPausesRequest,
} from "../request";
import {
  AddExternalPauseRequestFixture,
  GetExternalPausesCountQueryFixture,
  GetExternalPausesMembersQueryFixture,
  IsExternalPauseQueryFixture,
  IsPausedMockRequestFixture,
  RemoveExternalPauseRequestFixture,
  SetPausedMockCommandFixture,
  UpdateExternalPausesRequestFixture,
} from "@test/fixtures/externalPauses/ExternalPausesFixture";
import { UpdateExternalPausesCommand } from "@command/security/externalPauses/updateExternalPauses/UpdateExternalPausesCommand";
import { AddExternalPauseCommand } from "@command/security/externalPauses/addExternalPause/AddExternalPauseCommand";
import { RemoveExternalPauseCommand } from "@command/security/externalPauses/removeExternalPause/RemoveExternalPauseCommand";
import { IsExternalPauseQuery } from "@query/security/externalPauses/isExternalPause/IsExternalPauseQuery";
import { GetExternalPausesCountQuery } from "@query/security/externalPauses/getExternalPausesCount/GetExternalPausesCountQuery";
import { GetExternalPausesMembersQuery } from "@query/security/externalPauses/getExternalPausesMembers/GetExternalPausesMembersQuery";
import { SetPausedMockCommand } from "@command/security/externalPauses/mock/setPaused/SetPausedMockCommand";
import { CreateExternalPauseMockCommand } from "@command/security/externalPauses/mock/createExternalPauseMock/CreateExternalPauseMockCommand";
import { IsPausedMockQuery } from "@query/security/externalPauses/mock/isPaused/IsPausedMockQuery";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";

describe("ExternalPausesManagement", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let updateExternalPausesRequest: UpdateExternalPausesRequest;
  let addExternalPauseRequest: AddExternalPauseRequest;
  let removeExternalPauseRequest: RemoveExternalPauseRequest;
  let isExternalPauseRequest: IsExternalPauseRequest;
  let getExternalPausesCountRequest: GetExternalPausesCountRequest;
  let getExternalPausesMembersRequest: GetExternalPausesMembersRequest;
  let setPausedMockRequest: SetPausedMockRequest;
  let isPausedMockRequest: IsPausedMockRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;
  const hederaId = HederaIdPropsFixture.create().value;

  const expectedResponse = {
    payload: true,
    transactionId: transactionId,
  };

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (ExternalPausesManagement as any).commandBus = commandBusMock;
    (ExternalPausesManagement as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("updateExternalPauses", () => {
    updateExternalPausesRequest = new UpdateExternalPausesRequest(UpdateExternalPausesRequestFixture.create());
    it("should update external pause successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalPausesManagement.updateExternalPauses(updateExternalPausesRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateExternalPausesRequest", updateExternalPausesRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateExternalPausesCommand(
          updateExternalPausesRequest.securityId,
          updateExternalPausesRequest.externalPausesAddresses,
          updateExternalPausesRequest.actives,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalPausesManagement.updateExternalPauses(updateExternalPausesRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateExternalPausesRequest", updateExternalPausesRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateExternalPausesCommand(
          updateExternalPausesRequest.securityId,
          updateExternalPausesRequest.externalPausesAddresses,
          updateExternalPausesRequest.actives,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      updateExternalPausesRequest = new UpdateExternalPausesRequest({
        ...UpdateExternalPausesRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.updateExternalPauses(updateExternalPausesRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if externalPausesAddresses array is invalid", async () => {
      updateExternalPausesRequest = new UpdateExternalPausesRequest({
        ...UpdateExternalPausesRequestFixture.create({
          externalPausesAddresses: ["invalid"],
        }),
      });

      await expect(ExternalPausesManagement.updateExternalPauses(updateExternalPausesRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if externalPausesAddresses and active array are different", async () => {
      updateExternalPausesRequest = new UpdateExternalPausesRequest({
        ...UpdateExternalPausesRequestFixture.create({
          actives: [true, false],
        }),
      });

      await expect(ExternalPausesManagement.updateExternalPauses(updateExternalPausesRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("addExternalPause", () => {
    addExternalPauseRequest = new AddExternalPauseRequest(AddExternalPauseRequestFixture.create());
    it("should add external pause successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalPausesManagement.addExternalPause(addExternalPauseRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("AddExternalPauseRequest", addExternalPauseRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddExternalPauseCommand(addExternalPauseRequest.securityId, addExternalPauseRequest.externalPauseAddress),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalPausesManagement.addExternalPause(addExternalPauseRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("AddExternalPauseRequest", addExternalPauseRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddExternalPauseCommand(addExternalPauseRequest.securityId, addExternalPauseRequest.externalPauseAddress),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      addExternalPauseRequest = new AddExternalPauseRequest({
        ...AddExternalPauseRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.addExternalPause(addExternalPauseRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalPauseAddress is invalid", async () => {
      addExternalPauseRequest = new AddExternalPauseRequest({
        ...AddExternalPauseRequestFixture.create({
          externalPauseAddress: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.addExternalPause(addExternalPauseRequest)).rejects.toThrow(ValidationError);
    });
  });
  describe("removeExternalPause", () => {
    removeExternalPauseRequest = new RemoveExternalPauseRequest(RemoveExternalPauseRequestFixture.create());
    it("should remove external pause successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalPausesManagement.removeExternalPause(removeExternalPauseRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RemoveExternalPauseRequest", removeExternalPauseRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveExternalPauseCommand(
          removeExternalPauseRequest.securityId,
          removeExternalPauseRequest.externalPauseAddress,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalPausesManagement.removeExternalPause(removeExternalPauseRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("RemoveExternalPauseRequest", removeExternalPauseRequest);
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveExternalPauseCommand(
          removeExternalPauseRequest.securityId,
          removeExternalPauseRequest.externalPauseAddress,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      removeExternalPauseRequest = new RemoveExternalPauseRequest({
        ...RemoveExternalPauseRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.removeExternalPause(removeExternalPauseRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if externalPauseAddress is invalid", async () => {
      removeExternalPauseRequest = new RemoveExternalPauseRequest({
        ...RemoveExternalPauseRequestFixture.create({
          externalPauseAddress: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.removeExternalPause(removeExternalPauseRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("isExternalPause", () => {
    isExternalPauseRequest = new IsExternalPauseRequest(IsExternalPauseQueryFixture.create());
    const expectedQueryResponse = {
      payload: true,
    };

    it("should check if is external pause successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalPausesManagement.isExternalPause(isExternalPauseRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsExternalPauseRequest", isExternalPauseRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsExternalPauseQuery(isExternalPauseRequest.securityId, isExternalPauseRequest.externalPauseAddress),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(ExternalPausesManagement.isExternalPause(isExternalPauseRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("IsExternalPauseRequest", isExternalPauseRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsExternalPauseQuery(isExternalPauseRequest.securityId, isExternalPauseRequest.externalPauseAddress),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isExternalPauseRequest = new IsExternalPauseRequest({
        ...IsExternalPauseQueryFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.isExternalPause(isExternalPauseRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalPauseAddress is invalid", async () => {
      isExternalPauseRequest = new IsExternalPauseRequest({
        ...IsExternalPauseQueryFixture.create({
          externalPauseAddress: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.isExternalPause(isExternalPauseRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getExternalPausesCount", () => {
    getExternalPausesCountRequest = new GetExternalPausesCountRequest(GetExternalPausesCountQueryFixture.create());
    const expectedQueryResponse = {
      payload: 1,
    };

    it("should get external pauses count successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalPausesManagement.getExternalPausesCount(getExternalPausesCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetExternalPausesCountRequest", getExternalPausesCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalPausesCountQuery(getExternalPausesCountRequest.securityId),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(ExternalPausesManagement.getExternalPausesCount(getExternalPausesCountRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("GetExternalPausesCountRequest", getExternalPausesCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalPausesCountQuery(getExternalPausesCountRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getExternalPausesCountRequest = new GetExternalPausesCountRequest({
        ...GetExternalPausesCountQueryFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.getExternalPausesCount(getExternalPausesCountRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getExternalPausesMembers", () => {
    getExternalPausesMembersRequest = new GetExternalPausesMembersRequest(
      GetExternalPausesMembersQueryFixture.create(),
    );
    const expectedQueryResponse = {
      payload: [HederaIdPropsFixture.create().value],
    };

    it("should get external pauses members successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalPausesManagement.getExternalPausesMembers(getExternalPausesMembersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalPausesMembersRequest",
        getExternalPausesMembersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalPausesMembersQuery(
          getExternalPausesMembersRequest.securityId,
          getExternalPausesMembersRequest.start,
          getExternalPausesMembersRequest.end,
        ),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(ExternalPausesManagement.getExternalPausesMembers(getExternalPausesMembersRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalPausesMembersRequest",
        getExternalPausesMembersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalPausesMembersQuery(
          getExternalPausesMembersRequest.securityId,
          getExternalPausesMembersRequest.start,
          getExternalPausesMembersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getExternalPausesMembersRequest = new GetExternalPausesMembersRequest({
        ...GetExternalPausesMembersQueryFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.getExternalPausesMembers(getExternalPausesMembersRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if start is negative", async () => {
      getExternalPausesMembersRequest = new GetExternalPausesMembersRequest({
        ...GetExternalPausesMembersQueryFixture.create({
          start: -1,
        }),
      });

      await expect(ExternalPausesManagement.getExternalPausesMembers(getExternalPausesMembersRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if end is negative", async () => {
      getExternalPausesMembersRequest = new GetExternalPausesMembersRequest({
        ...GetExternalPausesMembersQueryFixture.create({
          end: -1,
        }),
      });

      await expect(ExternalPausesManagement.getExternalPausesMembers(getExternalPausesMembersRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("setPausedMock", () => {
    setPausedMockRequest = new SetPausedMockRequest(SetPausedMockCommandFixture.create());
    it("should add to external pause successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalPausesManagement.setPausedMock(setPausedMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetPausedMockRequest", setPausedMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetPausedMockCommand(setPausedMockRequest.contractId, setPausedMockRequest.paused),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalPausesManagement.setPausedMock(setPausedMockRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("SetPausedMockRequest", setPausedMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetPausedMockCommand(setPausedMockRequest.contractId, setPausedMockRequest.paused),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setPausedMockRequest = new SetPausedMockRequest({
        ...SetPausedMockCommandFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.setPausedMock(setPausedMockRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("createMock", () => {
    const expectedCommandResponse = {
      payload: hederaId,
    };

    it("should create external pause mock successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedCommandResponse);

      const result = await ExternalPausesManagement.createMock();

      expect(commandBusMock.execute).toHaveBeenCalledWith(new CreateExternalPauseMockCommand());

      expect(result).toEqual(expectedCommandResponse.payload);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalPausesManagement.createMock()).rejects.toThrow("Command execution failed");

      expect(commandBusMock.execute).toHaveBeenCalledWith(new CreateExternalPauseMockCommand());
    });
  });

  describe("isPausedMock", () => {
    isPausedMockRequest = new IsPausedMockRequest(IsPausedMockRequestFixture.create());
    const expectedQueryResponse = {
      payload: true,
    };

    it("should check if address is in external pause successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalPausesManagement.isPausedMock(isPausedMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsPausedMockRequest", isPausedMockRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsPausedMockQuery(isPausedMockRequest.contractId));

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(ExternalPausesManagement.isPausedMock(isPausedMockRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("IsPausedMockRequest", isPausedMockRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsPausedMockQuery(isPausedMockRequest.contractId));
    });

    it("should throw error if contractId is invalid", async () => {
      isPausedMockRequest = new IsPausedMockRequest({
        ...IsPausedMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(ExternalPausesManagement.isPausedMock(isPausedMockRequest)).rejects.toThrow(ValidationError);
    });
  });
});
