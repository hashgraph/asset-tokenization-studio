// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import ExternalControlListsManagement from "./ExternalControlListsManagement";
import { CommandBus } from "@core/command/CommandBus";
import {
  AddExternalControlListRequest,
  RemoveExternalControlListRequest,
  UpdateExternalControlListsRequest,
  GetExternalControlListsCountRequest,
  GetExternalControlListsMembersRequest,
  IsExternalControlListRequest,
  AddToBlackListMockRequest,
  AddToWhiteListMockRequest,
  RemoveFromBlackListMockRequest,
  RemoveFromWhiteListMockRequest,
  IsAuthorizedBlackListMockRequest,
  IsAuthorizedWhiteListMockRequest,
} from "../request";
import { UpdateExternalControlListsCommand } from "@command/security/externalControlLists/updateExternalControlLists/UpdateExternalControlListsCommand";
import {
  AddExternalControlListsRequestFixture,
  RemoveExternalControlListsRequestFixture,
  UpdateExternalControlListsRequestFixture,
  GetExternalControlListsCountRequestFixture,
  GetExternalControlListsMembersRequestFixture,
  IsExternalControlListRequestFixture,
  AddToBlackListMockRequestFixture,
  AddToWhiteListMockRequestFixture,
  RemoveFromBlackListMockRequestFixture,
  RemoveFromWhiteListMockRequestFixture,
  IsAuthorizedBlackListMockRequestFixture,
  IsAuthorizedWhiteListMockRequestFixture,
} from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { AddExternalControlListCommand } from "@command/security/externalControlLists/addExternalControlList/AddExternalControlListCommand";
import { RemoveExternalControlListCommand } from "@command/security/externalControlLists/removeExternalControlList/RemoveExternalControlListCommand";
import { QueryBus } from "@core/query/QueryBus";
import { IsExternalControlListQuery } from "@query/security/externalControlLists/isExternalControlList/IsExternalControlListQuery";
import { GetExternalControlListsCountQuery } from "@query/security/externalControlLists/getExternalControlListsCount/GetExternalControlListsCountQuery";
import { GetExternalControlListsMembersQuery } from "@query/security/externalControlLists/getExternalControlListsMembers/GetExternalControlListsMembersQuery";
import { AddToBlackListMockCommand } from "@command/security/externalControlLists/mock/addToBlackListMock/AddToBlackListMockCommand";
import { AddToWhiteListMockCommand } from "@command/security/externalControlLists/mock/addToWhiteListMock/AddToWhiteListMockCommand";
import { RemoveFromBlackListMockCommand } from "@command/security/externalControlLists/mock/removeFromBlackListMock/RemoveFromBlackListMockCommand";
import { RemoveFromWhiteListMockCommand } from "@command/security/externalControlLists/mock/removeFromWhiteListMock/RemoveFromWhiteListMockCommand";
import { CreateExternalBlackListMockCommand } from "@command/security/externalControlLists/mock/createExternalBlackListMock/CreateExternalBlackListMockCommand";
import { CreateExternalWhiteListMockCommand } from "@command/security/externalControlLists/mock/createExternalWhiteListMock/CreateExternalWhiteListMockCommand";
import { IsAuthorizedBlackListMockQuery } from "@query/security/externalControlLists/mock/isAuthorizedBlackListMock/IsAuthorizedBlackListMockQuery";
import { IsAuthorizedWhiteListMockQuery } from "@query/security/externalControlLists/mock/isAuthorizedWhiteListMock/IsAuthorizedWhiteListMockQuery";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
describe("ExternalControlListsManagement", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let updateExternalControlListsRequest: UpdateExternalControlListsRequest;
  let addExternalControlListsRequest: AddExternalControlListRequest;
  let removeExternalControlListsRequest: RemoveExternalControlListRequest;
  let isExternalControlListRequest: IsExternalControlListRequest;
  let getExternalControlListsCountRequest: GetExternalControlListsCountRequest;
  let getExternalControlListsMembersRequest: GetExternalControlListsMembersRequest;
  let addToBlackListMockRequest: AddToBlackListMockRequest;
  let addToWhiteListMockRequest: AddToWhiteListMockRequest;
  let removeFromBlackListMockRequest: RemoveFromBlackListMockRequest;
  let removeFromWhiteListMockRequest: RemoveFromWhiteListMockRequest;
  let isAuthorizedBlackListMockRequest: IsAuthorizedBlackListMockRequest;
  let isAuthorizedWhiteListMockRequest: IsAuthorizedWhiteListMockRequest;

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
    (ExternalControlListsManagement as any).commandBus = commandBusMock;
    (ExternalControlListsManagement as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("updateExternalControlListsPauses", () => {
    updateExternalControlListsRequest = new UpdateExternalControlListsRequest(
      UpdateExternalControlListsRequestFixture.create(),
    );
    it("should update external control lists successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalControlListsManagement.updateExternalControlLists(updateExternalControlListsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "UpdateExternalControlListsRequest",
        updateExternalControlListsRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateExternalControlListsCommand(
          updateExternalControlListsRequest.securityId,
          updateExternalControlListsRequest.externalControlListsAddresses,
          updateExternalControlListsRequest.actives,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalControlListsManagement.updateExternalControlLists(updateExternalControlListsRequest),
      ).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "UpdateExternalControlListsRequest",
        updateExternalControlListsRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateExternalControlListsCommand(
          updateExternalControlListsRequest.securityId,
          updateExternalControlListsRequest.externalControlListsAddresses,
          updateExternalControlListsRequest.actives,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      updateExternalControlListsRequest = new UpdateExternalControlListsRequest({
        ...UpdateExternalControlListsRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.updateExternalControlLists(updateExternalControlListsRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalControlListsAddresses array is invalid", async () => {
      updateExternalControlListsRequest = new UpdateExternalControlListsRequest({
        ...UpdateExternalControlListsRequestFixture.create({
          externalControlListsAddresses: ["invalid"],
        }),
      });

      await expect(
        ExternalControlListsManagement.updateExternalControlLists(updateExternalControlListsRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalControlListsAddresses and active array are different", async () => {
      updateExternalControlListsRequest = new UpdateExternalControlListsRequest({
        ...UpdateExternalControlListsRequestFixture.create({
          actives: [true, false],
        }),
      });

      await expect(
        ExternalControlListsManagement.updateExternalControlLists(updateExternalControlListsRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("addExternalControlList", () => {
    addExternalControlListsRequest = new AddExternalControlListRequest(AddExternalControlListsRequestFixture.create());
    it("should add external control list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalControlListsManagement.addExternalControlList(addExternalControlListsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("AddExternalControlListRequest", addExternalControlListsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddExternalControlListCommand(
          addExternalControlListsRequest.securityId,
          addExternalControlListsRequest.externalControlListAddress,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalControlListsManagement.addExternalControlList(addExternalControlListsRequest),
      ).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("AddExternalControlListRequest", addExternalControlListsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddExternalControlListCommand(
          addExternalControlListsRequest.securityId,
          addExternalControlListsRequest.externalControlListAddress,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      addExternalControlListsRequest = new AddExternalControlListRequest({
        ...AddExternalControlListsRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.addExternalControlList(addExternalControlListsRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalControlListAddress is invalid", async () => {
      addExternalControlListsRequest = new AddExternalControlListRequest({
        ...AddExternalControlListsRequestFixture.create({
          externalControlListAddress: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.addExternalControlList(addExternalControlListsRequest),
      ).rejects.toThrow(ValidationError);
    });
  });
  describe("removeExternalControlList", () => {
    removeExternalControlListsRequest = new RemoveExternalControlListRequest(
      RemoveExternalControlListsRequestFixture.create(),
    );
    it("should remove external control list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalControlListsManagement.removeExternalControlList(removeExternalControlListsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "RemoveExternalControlListRequest",
        removeExternalControlListsRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveExternalControlListCommand(
          removeExternalControlListsRequest.securityId,
          removeExternalControlListsRequest.externalControlListAddress,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalControlListsManagement.removeExternalControlList(removeExternalControlListsRequest),
      ).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "RemoveExternalControlListRequest",
        removeExternalControlListsRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveExternalControlListCommand(
          removeExternalControlListsRequest.securityId,
          removeExternalControlListsRequest.externalControlListAddress,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      removeExternalControlListsRequest = new RemoveExternalControlListRequest({
        ...RemoveExternalControlListsRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.removeExternalControlList(removeExternalControlListsRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalControlListAddress is invalid", async () => {
      removeExternalControlListsRequest = new RemoveExternalControlListRequest({
        ...RemoveExternalControlListsRequestFixture.create({
          externalControlListAddress: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.removeExternalControlList(removeExternalControlListsRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("isExternalControlList", () => {
    isExternalControlListRequest = new IsExternalControlListRequest(IsExternalControlListRequestFixture.create());
    const expectedQueryResponse = {
      payload: true,
    };

    it("should check if is external control list successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalControlListsManagement.isExternalControlList(isExternalControlListRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsExternalControlListRequest", isExternalControlListRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsExternalControlListQuery(
          isExternalControlListRequest.securityId,
          isExternalControlListRequest.externalControlListAddress,
        ),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(ExternalControlListsManagement.isExternalControlList(isExternalControlListRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("IsExternalControlListRequest", isExternalControlListRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsExternalControlListQuery(
          isExternalControlListRequest.securityId,
          isExternalControlListRequest.externalControlListAddress,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isExternalControlListRequest = new IsExternalControlListRequest({
        ...IsExternalControlListRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalControlListsManagement.isExternalControlList(isExternalControlListRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if externalControlListAddress is invalid", async () => {
      isExternalControlListRequest = new IsExternalControlListRequest({
        ...IsExternalControlListRequestFixture.create({
          externalControlListAddress: "invalid",
        }),
      });

      await expect(ExternalControlListsManagement.isExternalControlList(isExternalControlListRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getExternalControlListsCount", () => {
    getExternalControlListsCountRequest = new GetExternalControlListsCountRequest(
      GetExternalControlListsCountRequestFixture.create(),
    );
    const expectedQueryResponse = {
      payload: 1,
    };

    it("should get external control lists count successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalControlListsManagement.getExternalControlListsCount(
        getExternalControlListsCountRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalControlListsCountRequest",
        getExternalControlListsCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalControlListsCountQuery(getExternalControlListsCountRequest.securityId),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalControlListsManagement.getExternalControlListsCount(getExternalControlListsCountRequest),
      ).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalControlListsCountRequest",
        getExternalControlListsCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalControlListsCountQuery(getExternalControlListsCountRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getExternalControlListsCountRequest = new GetExternalControlListsCountRequest({
        ...GetExternalControlListsCountRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.getExternalControlListsCount(getExternalControlListsCountRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getExternalControlListsMembers", () => {
    getExternalControlListsMembersRequest = new GetExternalControlListsMembersRequest(
      GetExternalControlListsMembersRequestFixture.create(),
    );
    const expectedQueryResponse = {
      payload: [HederaIdPropsFixture.create().value],
    };

    it("should get external control lists members successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalControlListsManagement.getExternalControlListsMembers(
        getExternalControlListsMembersRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalControlListsMembersRequest",
        getExternalControlListsMembersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalControlListsMembersQuery(
          getExternalControlListsMembersRequest.securityId,
          getExternalControlListsMembersRequest.start,
          getExternalControlListsMembersRequest.end,
        ),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalControlListsManagement.getExternalControlListsMembers(getExternalControlListsMembersRequest),
      ).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalControlListsMembersRequest",
        getExternalControlListsMembersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalControlListsMembersQuery(
          getExternalControlListsMembersRequest.securityId,
          getExternalControlListsMembersRequest.start,
          getExternalControlListsMembersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getExternalControlListsMembersRequest = new GetExternalControlListsMembersRequest({
        ...GetExternalControlListsMembersRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.getExternalControlListsMembers(getExternalControlListsMembersRequest),
      ).rejects.toThrow(ValidationError);
    });
    it("should throw error if start is negative", async () => {
      getExternalControlListsMembersRequest = new GetExternalControlListsMembersRequest({
        ...GetExternalControlListsMembersRequestFixture.create({
          start: -1,
        }),
      });

      await expect(
        ExternalControlListsManagement.getExternalControlListsMembers(getExternalControlListsMembersRequest),
      ).rejects.toThrow(ValidationError);
    });
    it("should throw error if end is negative", async () => {
      getExternalControlListsMembersRequest = new GetExternalControlListsMembersRequest({
        ...GetExternalControlListsMembersRequestFixture.create({
          end: -1,
        }),
      });

      await expect(
        ExternalControlListsManagement.getExternalControlListsMembers(getExternalControlListsMembersRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("addToBlackListMock", () => {
    addToBlackListMockRequest = new AddToBlackListMockRequest(AddToBlackListMockRequestFixture.create());
    it("should add to external control black list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalControlListsManagement.addToBlackListMock(addToBlackListMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("AddToBlackListMockRequest", addToBlackListMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddToBlackListMockCommand(addToBlackListMockRequest.contractId, addToBlackListMockRequest.targetId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalControlListsManagement.addToBlackListMock(addToBlackListMockRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("AddToBlackListMockRequest", addToBlackListMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddToBlackListMockCommand(addToBlackListMockRequest.contractId, addToBlackListMockRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      addToBlackListMockRequest = new AddToBlackListMockRequest({
        ...AddToBlackListMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(ExternalControlListsManagement.addToBlackListMock(addToBlackListMockRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if targetId is invalid", async () => {
      addToBlackListMockRequest = new AddToBlackListMockRequest({
        ...AddToBlackListMockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(ExternalControlListsManagement.addToBlackListMock(addToBlackListMockRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });
  describe("addToWhiteListMock", () => {
    addToWhiteListMockRequest = new AddToWhiteListMockRequest(AddToWhiteListMockRequestFixture.create());
    it("should add to external control white list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalControlListsManagement.addToWhiteListMock(addToWhiteListMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("AddToWhiteListMockRequest", addToWhiteListMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddToWhiteListMockCommand(addToWhiteListMockRequest.contractId, addToWhiteListMockRequest.targetId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalControlListsManagement.addToWhiteListMock(addToWhiteListMockRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("AddToWhiteListMockRequest", addToWhiteListMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddToBlackListMockCommand(addToWhiteListMockRequest.contractId, addToWhiteListMockRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      addToWhiteListMockRequest = new AddToWhiteListMockRequest({
        ...AddToWhiteListMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(ExternalControlListsManagement.addToWhiteListMock(addToBlackListMockRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if targetId is invalid", async () => {
      addToWhiteListMockRequest = new AddToWhiteListMockRequest({
        ...AddToWhiteListMockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(ExternalControlListsManagement.addToWhiteListMock(addToBlackListMockRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("removeFromBlackListMock", () => {
    removeFromBlackListMockRequest = new RemoveFromBlackListMockRequest(RemoveFromBlackListMockRequestFixture.create());
    it("should remove from external control black list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalControlListsManagement.removeFromBlackListMock(removeFromBlackListMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "RemoveFromBlackListMockRequest",
        removeFromBlackListMockRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveFromBlackListMockCommand(
          removeFromBlackListMockRequest.contractId,
          removeFromBlackListMockRequest.targetId,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalControlListsManagement.removeFromBlackListMock(removeFromBlackListMockRequest),
      ).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "RemoveFromBlackListMockRequest",
        removeFromBlackListMockRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveFromBlackListMockCommand(
          removeFromBlackListMockRequest.contractId,
          removeFromBlackListMockRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      removeFromBlackListMockRequest = new RemoveFromBlackListMockRequest({
        ...RemoveFromBlackListMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.removeFromBlackListMock(removeFromBlackListMockRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      removeFromBlackListMockRequest = new RemoveFromBlackListMockRequest({
        ...RemoveFromBlackListMockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.removeFromBlackListMock(removeFromBlackListMockRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("removeFromWhiteListMock", () => {
    removeFromWhiteListMockRequest = new RemoveFromWhiteListMockRequest(RemoveFromWhiteListMockRequestFixture.create());
    it("should remove from external control white list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalControlListsManagement.removeFromWhiteListMock(removeFromWhiteListMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "RemoveFromWhiteListMockRequest",
        removeFromWhiteListMockRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveFromWhiteListMockCommand(
          removeFromWhiteListMockRequest.contractId,
          removeFromWhiteListMockRequest.targetId,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalControlListsManagement.removeFromWhiteListMock(removeFromWhiteListMockRequest),
      ).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "RemoveFromWhiteListMockRequest",
        removeFromWhiteListMockRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveFromWhiteListMockCommand(
          removeFromWhiteListMockRequest.contractId,
          removeFromWhiteListMockRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      removeFromWhiteListMockRequest = new RemoveFromWhiteListMockRequest({
        ...RemoveFromWhiteListMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.removeFromWhiteListMock(removeFromWhiteListMockRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      removeFromWhiteListMockRequest = new RemoveFromBlackListMockRequest({
        ...RemoveFromWhiteListMockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.removeFromWhiteListMock(removeFromWhiteListMockRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("createExternalBlackListMock", () => {
    const expectedCommandResponse = {
      payload: hederaId,
    };

    it("should create external control black list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedCommandResponse);

      const result = await ExternalControlListsManagement.createExternalBlackListMock();

      expect(commandBusMock.execute).toHaveBeenCalledWith(new CreateExternalBlackListMockCommand());

      expect(result).toEqual(expectedCommandResponse.payload);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalControlListsManagement.createExternalBlackListMock()).rejects.toThrow(
        "Command execution failed",
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(new CreateExternalBlackListMockCommand());
    });
  });

  describe("createExternalWhiteListMock", () => {
    const expectedCommandResponse = {
      payload: hederaId,
    };
    it("should create external control white list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedCommandResponse);

      const result = await ExternalControlListsManagement.createExternalWhiteListMock();

      expect(commandBusMock.execute).toHaveBeenCalledWith(new CreateExternalWhiteListMockCommand());

      expect(result).toEqual(expectedCommandResponse.payload);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalControlListsManagement.createExternalWhiteListMock()).rejects.toThrow(
        "Command execution failed",
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(new CreateExternalWhiteListMockCommand());
    });
  });

  describe("isAuthorizedBlackListMock", () => {
    isAuthorizedBlackListMockRequest = new IsAuthorizedBlackListMockRequest(
      IsAuthorizedBlackListMockRequestFixture.create(),
    );
    const expectedQueryResponse = {
      payload: true,
    };

    it("should check if address is in external control black list successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalControlListsManagement.isAuthorizedBlackListMock(isAuthorizedBlackListMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "IsAuthorizedBlackListMockRequest",
        isAuthorizedBlackListMockRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsAuthorizedBlackListMockQuery(
          isAuthorizedBlackListMockRequest.contractId,
          isAuthorizedBlackListMockRequest.targetId,
        ),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalControlListsManagement.isAuthorizedBlackListMock(isAuthorizedBlackListMockRequest),
      ).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "IsAuthorizedBlackListMockRequest",
        isAuthorizedBlackListMockRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsAuthorizedBlackListMockQuery(
          isAuthorizedBlackListMockRequest.contractId,
          isAuthorizedBlackListMockRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isAuthorizedBlackListMockRequest = new IsAuthorizedBlackListMockRequest({
        ...IsAuthorizedBlackListMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.isAuthorizedBlackListMock(isAuthorizedBlackListMockRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      isAuthorizedBlackListMockRequest = new IsAuthorizedBlackListMockRequest({
        ...IsAuthorizedBlackListMockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.isAuthorizedBlackListMock(isAuthorizedBlackListMockRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("isAuthorizedWhiteListMock", () => {
    isAuthorizedWhiteListMockRequest = new IsAuthorizedWhiteListMockRequest(
      IsAuthorizedWhiteListMockRequestFixture.create(),
    );
    const expectedQueryResponse = {
      payload: true,
    };

    it("should check if address is in external control white list successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalControlListsManagement.isAuthorizedWhiteListMock(isAuthorizedWhiteListMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "IsAuthorizedWhiteListMockRequest",
        isAuthorizedWhiteListMockRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsAuthorizedWhiteListMockQuery(
          isAuthorizedWhiteListMockRequest.contractId,
          isAuthorizedWhiteListMockRequest.targetId,
        ),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalControlListsManagement.isAuthorizedWhiteListMock(isAuthorizedWhiteListMockRequest),
      ).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "IsAuthorizedWhiteListMockRequest",
        isAuthorizedWhiteListMockRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsAuthorizedWhiteListMockQuery(
          isAuthorizedWhiteListMockRequest.contractId,
          isAuthorizedWhiteListMockRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isAuthorizedWhiteListMockRequest = new IsAuthorizedWhiteListMockRequest({
        ...IsAuthorizedWhiteListMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.isAuthorizedWhiteListMock(isAuthorizedWhiteListMockRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      isAuthorizedWhiteListMockRequest = new IsAuthorizedWhiteListMockRequest({
        ...IsAuthorizedWhiteListMockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(
        ExternalControlListsManagement.isAuthorizedWhiteListMock(isAuthorizedWhiteListMockRequest),
      ).rejects.toThrow(ValidationError);
    });
  });
});
