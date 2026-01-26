// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  ControlListRequest,
  GetControlListCountRequest,
  GetControlListMembersRequest,
  GetControlListTypeRequest,
} from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security, { SecurityControlListType } from "@port/in/security/Security";
import {
  ControlListRequestFixture,
  GetControlListCountRequestFixture,
  GetControlListMembersRequestFixture,
  GetControlListTypeRequestFixture,
} from "@test/fixtures/controlList/ControlListFixture";
import { AddToControlListCommand } from "@command/security/operations/addToControlList/AddToControlListCommand";
import { RemoveFromControlListCommand } from "@command/security/operations/removeFromControlList/RemoveFromControlListCommand";
import { IsInControlListQuery } from "@query/account/controlList/IsInControlListQuery";
import { GetControlListCountQuery } from "@query/security/controlList/getControlListCount/GetControlListCountQuery";
import { GetControlListMembersQuery } from "@query/security/controlList/getControlListMembers/GetControlListMembersQuery";
import { GetControlListTypeQuery } from "@query/security/controlList/getControlListType/GetControlListTypeQuery";

describe("Control List", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let getControlListCountRequest: GetControlListCountRequest;
  let getControlListMembersRequest: GetControlListMembersRequest;
  let getControlListTypeRequest: GetControlListTypeRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());

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

  describe("addToControlList", () => {
    const controlListRequest = new ControlListRequest(ControlListRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should add to control list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.addToControlList(controlListRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ControlListRequest", controlListRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddToControlListCommand(controlListRequest.targetId, controlListRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.addToControlList(controlListRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ControlListRequest", controlListRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddToControlListCommand(controlListRequest.targetId, controlListRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const controlListRequest = new ControlListRequest({
        ...ControlListRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.addToControlList(controlListRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      const controlListRequest = new ControlListRequest({
        ...ControlListRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.addToControlList(controlListRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("removeFromControlList", () => {
    const controlListRequest = new ControlListRequest(ControlListRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should remove from control list successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.removeFromControlList(controlListRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ControlListRequest", controlListRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveFromControlListCommand(controlListRequest.targetId, controlListRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.removeFromControlList(controlListRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ControlListRequest", controlListRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveFromControlListCommand(controlListRequest.targetId, controlListRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const controlListRequest = new ControlListRequest({
        ...ControlListRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.removeFromControlList(controlListRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      const controlListRequest = new ControlListRequest({
        ...ControlListRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.removeFromControlList(controlListRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("isAccountInControlList", () => {
    const controlListRequest = new ControlListRequest(ControlListRequestFixture.create());

    const expectedResponse = {
      payload: true,
    };
    it("should get is account in control list successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.isAccountInControlList(controlListRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ControlListRequest", controlListRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsInControlListQuery(controlListRequest.securityId, controlListRequest.targetId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.isAccountInControlList(controlListRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ControlListRequest", controlListRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsInControlListQuery(controlListRequest.securityId, controlListRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const controlListRequest = new ControlListRequest({
        ...ControlListRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.isAccountInControlList(controlListRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      const controlListRequest = new ControlListRequest({
        ...ControlListRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.isAccountInControlList(controlListRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getControlListCount", () => {
    getControlListCountRequest = new GetControlListCountRequest(GetControlListCountRequestFixture.create());

    const expectedResponse = {
      payload: 1,
    };
    it("should get control list count successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getControlListCount(getControlListCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetControlListCountRequest", getControlListCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetControlListCountQuery(getControlListCountRequest.securityId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getControlListCount(getControlListCountRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetControlListCountRequest", getControlListCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetControlListCountQuery(getControlListCountRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getControlListCountRequest = new GetControlListCountRequest({
        ...GetControlListCountRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getControlListCount(getControlListCountRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getControlListMembers", () => {
    getControlListMembersRequest = new GetControlListMembersRequest(GetControlListMembersRequestFixture.create());

    const expectedResponse = {
      payload: [account.id.toString()],
    };
    it("should get control list members successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);
      mirrorNodeMock.getAccountInfo.mockResolvedValue(account);

      const result = await Security.getControlListMembers(getControlListMembersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetControlListMembersRequest", getControlListMembersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetControlListMembersQuery(
          getControlListMembersRequest.securityId,
          getControlListMembersRequest.start,
          getControlListMembersRequest.end,
        ),
      );
      expect(mirrorNodeMock.getAccountInfo).toHaveBeenCalledWith(account.id.toString());
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getControlListMembers(getControlListMembersRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("GetControlListMembersRequest", getControlListMembersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetControlListMembersQuery(
          getControlListMembersRequest.securityId,
          getControlListMembersRequest.start,
          getControlListMembersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getControlListMembersRequest = new GetControlListMembersRequest({
        ...GetControlListMembersRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getControlListMembers(getControlListMembersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getControlListType", () => {
    getControlListTypeRequest = new GetControlListTypeRequest(GetControlListTypeRequestFixture.create());

    const expectedResponse = {
      payload: SecurityControlListType.BLACKLIST,
    };
    it("should get control list type successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getControlListType(getControlListTypeRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetControlListTypeRequest", getControlListTypeRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetControlListTypeQuery(getControlListTypeRequest.securityId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getControlListType(getControlListTypeRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetControlListTypeRequest", getControlListTypeRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetControlListTypeQuery(getControlListTypeRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getControlListTypeRequest = new GetControlListTypeRequest({
        ...GetControlListTypeRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getControlListType(getControlListCountRequest)).rejects.toThrow(ValidationError);
    });
  });
});
