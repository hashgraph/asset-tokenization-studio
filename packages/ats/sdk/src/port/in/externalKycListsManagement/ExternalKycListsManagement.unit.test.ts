// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  AddExternalKycListRequest,
  RemoveExternalKycListRequest,
  UpdateExternalKycListsRequest,
  GetExternalKycListsCountRequest,
  GetExternalKycListsMembersRequest,
  IsExternalKycListRequest,
  IsExternallyGrantedRequest,
  GrantKycMockRequest,
  RevokeKycMockRequest,
  GetKycStatusMockRequest,
} from "../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import {
  AddExternalKycListsRequestFixture,
  RemoveExternalKycListsRequestFixture,
  UpdateExternalKycListsRequestFixture,
  GetExternalKycListsCountRequestFixture,
  GetExternalKycListsMembersRequestFixture,
  IsExternalKycListRequestFixture,
  IsExternallyGrantedRequestFixture,
  GrantKycMockRequestFixture,
  RevokeKycMockRequestFixture,
  GetKycStatusMockRequestFixture,
} from "@test/fixtures/externalKycLists/ExternalKycListsFixture";
import ExternalKycListsManagement from "./ExternalKycListsManagement";
import { UpdateExternalKycListsCommand } from "@command/security/externalKycLists/updateExternalKycLists/UpdateExternalKycListsCommand";
import { AddExternalKycListCommand } from "@command/security/externalKycLists/addExternalKycList/AddExternalKycListCommand";
import { RemoveExternalKycListCommand } from "@command/security/externalKycLists/removeExternalKycList/RemoveExternalKycListCommand";
import { IsExternallyGrantedQuery } from "@query/security/externalKycLists/isExternallyGranted/IsExternallyGrantedQuery";
import { IsExternalKycListQuery } from "@query/security/externalKycLists/isExternalKycList/IsExternalKycListQuery";
import { GetExternalKycListsCountQuery } from "@query/security/externalKycLists/getExternalKycListsCount/GetExternalKycListsCountQuery";
import { GetExternalKycListsMembersQuery } from "@query/security/externalKycLists/getExternalKycListsMembers/GetExternalKycListsMembersQuery";
import { GrantKycMockCommand } from "@command/security/externalKycLists/mock/grantKycMock/GrantKycMockCommand";
import { RevokeKycMockCommand } from "@command/security/externalKycLists/mock/revokeKycMock/RevokeKycMockCommand";
import { GetKycStatusMockQuery } from "@query/security/externalKycLists/mock/getKycStatusMock/GetKycStatusMockQuery";
import { CreateExternalKycListMockCommand } from "@command/security/externalKycLists/mock/createExternalKycMock/CreateExternalKycMockCommand";
describe("ExternalKycListsManagement", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let updateExternalKycListsRequest: UpdateExternalKycListsRequest;
  let addExternalKycListsRequest: AddExternalKycListRequest;
  let removeExternalKycListsRequest: RemoveExternalKycListRequest;
  let isExternallyGrantedRequest: IsExternallyGrantedRequest;
  let isExternalKycListRequest: IsExternalKycListRequest;
  let getExternalKycListsCountRequest: GetExternalKycListsCountRequest;
  let getExternalKycListsMembersRequest: GetExternalKycListsMembersRequest;
  let grantKycMockRequest: GrantKycMockRequest;
  let revokeKycMockRequest: RevokeKycMockRequest;
  let getKycStatusMockRequest: GetKycStatusMockRequest;

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
    (ExternalKycListsManagement as any).commandBus = commandBusMock;
    (ExternalKycListsManagement as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("updateExternalKycListsPauses", () => {
    updateExternalKycListsRequest = new UpdateExternalKycListsRequest(UpdateExternalKycListsRequestFixture.create());
    it("should update external kyc lists successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalKycListsManagement.updateExternalKycLists(updateExternalKycListsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateExternalKycListsRequest", updateExternalKycListsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateExternalKycListsCommand(
          updateExternalKycListsRequest.securityId,
          updateExternalKycListsRequest.externalKycListsAddresses,
          updateExternalKycListsRequest.actives,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalKycListsManagement.updateExternalKycLists(updateExternalKycListsRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateExternalKycListsRequest", updateExternalKycListsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateExternalKycListsCommand(
          updateExternalKycListsRequest.securityId,
          updateExternalKycListsRequest.externalKycListsAddresses,
          updateExternalKycListsRequest.actives,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      updateExternalKycListsRequest = new UpdateExternalKycListsRequest({
        ...UpdateExternalKycListsRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.updateExternalKycLists(updateExternalKycListsRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if externalKycListsAddresses array is invalid", async () => {
      updateExternalKycListsRequest = new UpdateExternalKycListsRequest({
        ...UpdateExternalKycListsRequestFixture.create({
          externalKycListsAddresses: ["invalid"],
        }),
      });

      await expect(ExternalKycListsManagement.updateExternalKycLists(updateExternalKycListsRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if externalKycListsAddresses and active array are different", async () => {
      updateExternalKycListsRequest = new UpdateExternalKycListsRequest({
        ...UpdateExternalKycListsRequestFixture.create({
          actives: [true, false],
        }),
      });

      await expect(ExternalKycListsManagement.updateExternalKycLists(updateExternalKycListsRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });
  describe("addExternalKycList", () => {
    addExternalKycListsRequest = new AddExternalKycListRequest(AddExternalKycListsRequestFixture.create());
    it("should add external kyc list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalKycListsManagement.addExternalKycList(addExternalKycListsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("AddExternalKycListRequest", addExternalKycListsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddExternalKycListCommand(
          addExternalKycListsRequest.securityId,
          addExternalKycListsRequest.externalKycListAddress,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalKycListsManagement.addExternalKycList(addExternalKycListsRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("AddExternalKycListRequest", addExternalKycListsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddExternalKycListCommand(
          addExternalKycListsRequest.securityId,
          addExternalKycListsRequest.externalKycListAddress,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      addExternalKycListsRequest = new AddExternalKycListRequest({
        ...AddExternalKycListsRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.addExternalKycList(addExternalKycListsRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if externalKycListAddress is invalid", async () => {
      addExternalKycListsRequest = new AddExternalKycListRequest({
        ...AddExternalKycListsRequestFixture.create({
          externalKycListAddress: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.addExternalKycList(addExternalKycListsRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });
  describe("removeExternalKycList", () => {
    removeExternalKycListsRequest = new RemoveExternalKycListRequest(RemoveExternalKycListsRequestFixture.create());
    it("should remove external kyc list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalKycListsManagement.removeExternalKycList(removeExternalKycListsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RemoveExternalKycListRequest", removeExternalKycListsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveExternalKycListCommand(
          removeExternalKycListsRequest.securityId,
          removeExternalKycListsRequest.externalKycListAddress,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalKycListsManagement.removeExternalKycList(removeExternalKycListsRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("RemoveExternalKycListRequest", removeExternalKycListsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveExternalKycListCommand(
          removeExternalKycListsRequest.securityId,
          removeExternalKycListsRequest.externalKycListAddress,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      removeExternalKycListsRequest = new RemoveExternalKycListRequest({
        ...RemoveExternalKycListsRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.removeExternalKycList(removeExternalKycListsRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if externalKycListAddress is invalid", async () => {
      removeExternalKycListsRequest = new RemoveExternalKycListRequest({
        ...RemoveExternalKycListsRequestFixture.create({
          externalKycListAddress: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.removeExternalKycList(removeExternalKycListsRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("isExternallyGranted", () => {
    isExternallyGrantedRequest = new IsExternallyGrantedRequest(IsExternallyGrantedRequestFixture.create());
    const expectedQueryResponse = {
      payload: true,
    };

    it("should check if address is externally granted successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalKycListsManagement.isExternallyGranted(isExternallyGrantedRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsExternallyGrantedRequest", isExternallyGrantedRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsExternallyGrantedQuery(
          isExternallyGrantedRequest.securityId,
          isExternallyGrantedRequest.kycStatus,
          isExternallyGrantedRequest.targetId,
        ),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(ExternalKycListsManagement.isExternallyGranted(isExternallyGrantedRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("IsExternallyGrantedRequest", isExternallyGrantedRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsExternallyGrantedQuery(
          isExternallyGrantedRequest.securityId,
          isExternallyGrantedRequest.kycStatus,
          isExternallyGrantedRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isExternallyGrantedRequest = new IsExternallyGrantedRequest({
        ...IsExternallyGrantedRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.isExternallyGranted(isExternallyGrantedRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if targetId is invalid", async () => {
      isExternallyGrantedRequest = new IsExternallyGrantedRequest({
        ...IsExternallyGrantedRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.isExternallyGranted(isExternallyGrantedRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if kycStatus is invalid", async () => {
      isExternallyGrantedRequest = new IsExternallyGrantedRequest({
        ...IsExternallyGrantedRequestFixture.create({
          kycStatus: -1,
        }),
      });

      await expect(ExternalKycListsManagement.isExternallyGranted(isExternallyGrantedRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("isExternalKycList", () => {
    isExternalKycListRequest = new IsExternalKycListRequest(IsExternalKycListRequestFixture.create());
    const expectedQueryResponse = {
      payload: true,
    };

    it("should check if is external kyc list successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalKycListsManagement.isExternalKycList(isExternalKycListRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsExternalKycListRequest", isExternalKycListRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsExternalKycListQuery(
          isExternalKycListRequest.securityId,
          isExternalKycListRequest.externalKycListAddress,
        ),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(ExternalKycListsManagement.isExternalKycList(isExternalKycListRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("IsExternalKycListRequest", isExternalKycListRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsExternalKycListQuery(
          isExternalKycListRequest.securityId,
          isExternalKycListRequest.externalKycListAddress,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isExternalKycListRequest = new IsExternalKycListRequest({
        ...IsExternalKycListRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.isExternalKycList(isExternalKycListRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if externalKycListAddress is invalid", async () => {
      isExternalKycListRequest = new IsExternalKycListRequest({
        ...IsExternalKycListRequestFixture.create({
          externalKycListAddress: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.isExternalKycList(isExternalKycListRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getExternalKycListsCount", () => {
    getExternalKycListsCountRequest = new GetExternalKycListsCountRequest(
      GetExternalKycListsCountRequestFixture.create(),
    );
    const expectedQueryResponse = {
      payload: 1,
    };

    it("should get external kyc lists count successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalKycListsManagement.getExternalKycListsCount(getExternalKycListsCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalKycListsCountRequest",
        getExternalKycListsCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalKycListsCountQuery(getExternalKycListsCountRequest.securityId),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalKycListsManagement.getExternalKycListsCount(getExternalKycListsCountRequest),
      ).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalKycListsCountRequest",
        getExternalKycListsCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalKycListsCountQuery(getExternalKycListsCountRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getExternalKycListsCountRequest = new GetExternalKycListsCountRequest({
        ...GetExternalKycListsCountRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(
        ExternalKycListsManagement.getExternalKycListsCount(getExternalKycListsCountRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getExternalKycListsMembers", () => {
    getExternalKycListsMembersRequest = new GetExternalKycListsMembersRequest(
      GetExternalKycListsMembersRequestFixture.create(),
    );
    const expectedQueryResponse = {
      payload: [HederaIdPropsFixture.create().value],
    };

    it("should get external kyc lists members successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalKycListsManagement.getExternalKycListsMembers(getExternalKycListsMembersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalKycListsMembersRequest",
        getExternalKycListsMembersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalKycListsMembersQuery(
          getExternalKycListsMembersRequest.securityId,
          getExternalKycListsMembersRequest.start,
          getExternalKycListsMembersRequest.end,
        ),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        ExternalKycListsManagement.getExternalKycListsMembers(getExternalKycListsMembersRequest),
      ).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetExternalKycListsMembersRequest",
        getExternalKycListsMembersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetExternalKycListsMembersQuery(
          getExternalKycListsMembersRequest.securityId,
          getExternalKycListsMembersRequest.start,
          getExternalKycListsMembersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getExternalKycListsMembersRequest = new GetExternalKycListsMembersRequest({
        ...GetExternalKycListsMembersRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(
        ExternalKycListsManagement.getExternalKycListsMembers(getExternalKycListsMembersRequest),
      ).rejects.toThrow(ValidationError);
    });
    it("should throw error if start is negative", async () => {
      getExternalKycListsMembersRequest = new GetExternalKycListsMembersRequest({
        ...GetExternalKycListsMembersRequestFixture.create({
          start: -1,
        }),
      });

      await expect(
        ExternalKycListsManagement.getExternalKycListsMembers(getExternalKycListsMembersRequest),
      ).rejects.toThrow(ValidationError);
    });
    it("should throw error if end is negative", async () => {
      getExternalKycListsMembersRequest = new GetExternalKycListsMembersRequest({
        ...GetExternalKycListsMembersRequestFixture.create({
          end: -1,
        }),
      });

      await expect(
        ExternalKycListsManagement.getExternalKycListsMembers(getExternalKycListsMembersRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("grantKycMockRequest", () => {
    grantKycMockRequest = new GrantKycMockRequest(GrantKycMockRequestFixture.create());
    it("should grant kyc mock successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalKycListsManagement.grantKycMock(grantKycMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GrantKycMockRequest", grantKycMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new GrantKycMockCommand(grantKycMockRequest.contractId, grantKycMockRequest.targetId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalKycListsManagement.grantKycMock(grantKycMockRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("GrantKycMockRequest", grantKycMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new GrantKycMockCommand(grantKycMockRequest.contractId, grantKycMockRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      grantKycMockRequest = new GrantKycMockRequest({
        ...GrantKycMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.grantKycMock(grantKycMockRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      grantKycMockRequest = new GrantKycMockRequest({
        ...GrantKycMockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.grantKycMock(grantKycMockRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("revokeKycMock", () => {
    revokeKycMockRequest = new RevokeKycMockRequest(RevokeKycMockRequestFixture.create());
    it("should revoke kyc mock successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ExternalKycListsManagement.revokeKycMock(revokeKycMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RevokeKycMockRequest", revokeKycMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RevokeKycMockCommand(revokeKycMockRequest.contractId, revokeKycMockRequest.targetId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalKycListsManagement.revokeKycMock(revokeKycMockRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("RevokeKycMockRequest", revokeKycMockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RevokeKycMockCommand(revokeKycMockRequest.contractId, revokeKycMockRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      revokeKycMockRequest = new RevokeKycMockRequest({
        ...RevokeKycMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.revokeKycMock(revokeKycMockRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      grantKycMockRequest = new GrantKycMockRequest({
        ...GrantKycMockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.grantKycMock(grantKycMockRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getKycStatusMock", () => {
    getKycStatusMockRequest = new GetKycStatusMockRequest(GetKycStatusMockRequestFixture.create());
    const expectedQueryResponse = {
      payload: true,
    };
    it("should get kyc status mock successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await ExternalKycListsManagement.getKycStatusMock(getKycStatusMockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycStatusMockRequest", getKycStatusMockRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycStatusMockQuery(getKycStatusMockRequest.contractId, getKycStatusMockRequest.targetId),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(ExternalKycListsManagement.getKycStatusMock(getKycStatusMockRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycStatusMockRequest", getKycStatusMockRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycStatusMockQuery(getKycStatusMockRequest.contractId, getKycStatusMockRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getKycStatusMockRequest = new GetKycStatusMockRequest({
        ...GetKycStatusMockRequestFixture.create({
          contractId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.getKycStatusMock(getKycStatusMockRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if targetId is invalid", async () => {
      getKycStatusMockRequest = new GetKycStatusMockRequest({
        ...GetKycStatusMockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(ExternalKycListsManagement.getKycStatusMock(getKycStatusMockRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("createExternalKycMock", () => {
    const expectedCommandResponse = {
      payload: hederaId,
    };

    it("should create external kyc list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedCommandResponse);

      const result = await ExternalKycListsManagement.createExternalKycMock();

      expect(commandBusMock.execute).toHaveBeenCalledWith(new CreateExternalKycListMockCommand());

      expect(result).toEqual(expectedCommandResponse.payload);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(ExternalKycListsManagement.createExternalKycMock()).rejects.toThrow("Command execution failed");

      expect(commandBusMock.execute).toHaveBeenCalledWith(new CreateExternalKycListMockCommand());
    });
  });
});
