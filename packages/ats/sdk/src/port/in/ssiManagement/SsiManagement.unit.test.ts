// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  AddIssuerRequest,
  GetIssuerListCountRequest,
  GetIssuerListMembersRequest,
  GetRevocationRegistryAddressRequest,
  IsIssuerRequest,
  RemoveIssuerRequest,
  SetRevocationRegistryAddressRequest,
} from "../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import SsiManagement from "./SsiManagement";
import {
  AddIssuerRequestFixture,
  GetIssuerListCountRequestFixture,
  GetIssuerListMembersRequestFixture,
  GetRevocationRegistryAddressRequestFixture,
  IsIssuerRequestFixture,
  RemoveIssuerRequestFixture,
  SetRevocationRegistryAddressRequestFixture,
} from "@test/fixtures/ssi/SsiFixture";
import { AddIssuerCommand } from "@command/security/ssi/addIssuer/AddIssuerCommand";
import { SetRevocationRegistryAddressCommand } from "@command/security/ssi/setRevocationRegistryAddress/SetRevocationRegistryAddressCommand";
import { RemoveIssuerCommand } from "@command/security/ssi/removeIssuer/RemoveIssuerCommand";
import { GetRevocationRegistryAddressQuery } from "@query/security/ssi/getRevocationRegistryAddress/GetRevocationRegistryAddressQuery";
import { GetIssuerListCountQuery } from "@query/security/ssi/getIssuerListCount/GetIssuerListCountQuery";
import { GetIssuerListMembersQuery } from "@query/security/ssi/getIssuerListMembers/GetIssuerListMembersQuery";
import { IsIssuerQuery } from "@query/security/ssi/isIssuer/IsIssuerQuery";

describe("Ssi Management", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;

  let setRevocationRegistryAddressRequest: SetRevocationRegistryAddressRequest;
  let addIssuerRequest: AddIssuerRequest;
  let removeIssuerRequest: RemoveIssuerRequest;
  let getRevocationRegistryAddressRequest: GetRevocationRegistryAddressRequest;
  let getIssuerListCountRequest: GetIssuerListCountRequest;
  let getIssuerListMembersRequest: GetIssuerListMembersRequest;
  let isIssuerRequest: IsIssuerRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (SsiManagement as any).commandBus = commandBusMock;
    (SsiManagement as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("addIssuer", () => {
    addIssuerRequest = new AddIssuerRequest(AddIssuerRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should  add issuer successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await SsiManagement.addIssuer(addIssuerRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("AddIssuerRequest", addIssuerRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddIssuerCommand(addIssuerRequest.securityId, addIssuerRequest.issuerId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(SsiManagement.addIssuer(addIssuerRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("AddIssuerRequest", addIssuerRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddIssuerCommand(addIssuerRequest.securityId, addIssuerRequest.issuerId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      addIssuerRequest = new AddIssuerRequest({
        ...AddIssuerRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(SsiManagement.addIssuer(addIssuerRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if issuerId is invalid", async () => {
      addIssuerRequest = new AddIssuerRequest({
        ...AddIssuerRequestFixture.create({
          issuerId: "invalid",
        }),
      });

      await expect(SsiManagement.addIssuer(addIssuerRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("setRevocationRegistryAddress", () => {
    setRevocationRegistryAddressRequest = new SetRevocationRegistryAddressRequest(
      SetRevocationRegistryAddressRequestFixture.create(),
    );

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should set revocation registry successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await SsiManagement.setRevocationRegistryAddress(setRevocationRegistryAddressRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "SetRevocationRegistryAddressRequest",
        setRevocationRegistryAddressRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetRevocationRegistryAddressCommand(
          setRevocationRegistryAddressRequest.securityId,
          setRevocationRegistryAddressRequest.revocationRegistryId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(SsiManagement.setRevocationRegistryAddress(setRevocationRegistryAddressRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "SetRevocationRegistryAddressRequest",
        setRevocationRegistryAddressRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetRevocationRegistryAddressCommand(
          setRevocationRegistryAddressRequest.securityId,
          setRevocationRegistryAddressRequest.revocationRegistryId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setRevocationRegistryAddressRequest = new SetRevocationRegistryAddressRequest({
        ...SetRevocationRegistryAddressRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(SsiManagement.setRevocationRegistryAddress(setRevocationRegistryAddressRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if revocationRegistryId is invalid", async () => {
      setRevocationRegistryAddressRequest = new SetRevocationRegistryAddressRequest({
        ...SetRevocationRegistryAddressRequestFixture.create({
          revocationRegistryId: "invalid",
        }),
      });

      await expect(SsiManagement.setRevocationRegistryAddress(setRevocationRegistryAddressRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("removeIssuer", () => {
    removeIssuerRequest = new RemoveIssuerRequest(RemoveIssuerRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should remove issuer successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await SsiManagement.removeIssuer(removeIssuerRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RemoveIssuerRequest", removeIssuerRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveIssuerCommand(removeIssuerRequest.securityId, removeIssuerRequest.issuerId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(SsiManagement.removeIssuer(removeIssuerRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("RemoveIssuerRequest", removeIssuerRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveIssuerCommand(removeIssuerRequest.securityId, removeIssuerRequest.issuerId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      removeIssuerRequest = new RemoveIssuerRequest({
        ...RemoveIssuerRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(SsiManagement.removeIssuer(removeIssuerRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if issuerId is invalid", async () => {
      removeIssuerRequest = new RemoveIssuerRequest({
        ...RemoveIssuerRequestFixture.create({
          issuerId: "invalid",
        }),
      });

      await expect(SsiManagement.removeIssuer(removeIssuerRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getRevocationRegistryAddress", () => {
    getRevocationRegistryAddressRequest = new GetRevocationRegistryAddressRequest(
      GetRevocationRegistryAddressRequestFixture.create(),
    );

    const expectedResponse = {
      payload: transactionId,
    };
    it("should get revocation registry successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await SsiManagement.getRevocationRegistryAddress(getRevocationRegistryAddressRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetRevocationRegistryAddressRequest",
        getRevocationRegistryAddressRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRevocationRegistryAddressQuery(getRevocationRegistryAddressRequest.securityId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(SsiManagement.getRevocationRegistryAddress(getRevocationRegistryAddressRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetRevocationRegistryAddressRequest",
        getRevocationRegistryAddressRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRevocationRegistryAddressQuery(getRevocationRegistryAddressRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getRevocationRegistryAddressRequest = new GetRevocationRegistryAddressRequest({
        ...GetRevocationRegistryAddressRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(SsiManagement.getRevocationRegistryAddress(getRevocationRegistryAddressRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getIssuerListCount", () => {
    getIssuerListCountRequest = new GetIssuerListCountRequest(GetIssuerListCountRequestFixture.create());

    const expectedResponse = {
      payload: 1,
    };
    it("should get revocation registry successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await SsiManagement.getIssuerListCount(getIssuerListCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetIssuerListCountRequest", getIssuerListCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetIssuerListCountQuery(getIssuerListCountRequest.securityId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(SsiManagement.getIssuerListCount(getIssuerListCountRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("GetIssuerListCountRequest", getIssuerListCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetIssuerListCountQuery(getIssuerListCountRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getIssuerListCountRequest = new GetIssuerListCountRequest({
        ...GetIssuerListCountRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(SsiManagement.getIssuerListCount(getIssuerListCountRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getIssuerListMembers", () => {
    getIssuerListMembersRequest = new GetIssuerListMembersRequest(GetIssuerListMembersRequestFixture.create());

    const expectedResponse = {
      payload: [transactionId],
    };
    it("should get issuer list members successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await SsiManagement.getIssuerListMembers(getIssuerListMembersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetIssuerListMembersRequest", getIssuerListMembersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetIssuerListMembersQuery(
          getIssuerListMembersRequest.securityId,
          getIssuerListMembersRequest.start,
          getIssuerListMembersRequest.end,
        ),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(SsiManagement.getIssuerListMembers(getIssuerListMembersRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("GetIssuerListMembersRequest", getIssuerListMembersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetIssuerListMembersQuery(
          getIssuerListMembersRequest.securityId,
          getIssuerListMembersRequest.start,
          getIssuerListMembersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getIssuerListMembersRequest = new GetIssuerListMembersRequest({
        ...GetIssuerListMembersRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(SsiManagement.getIssuerListMembers(getIssuerListMembersRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if start is invalid", async () => {
      getIssuerListMembersRequest = new GetIssuerListMembersRequest({
        ...GetIssuerListMembersRequestFixture.create({
          start: -1,
        }),
      });

      await expect(SsiManagement.getIssuerListMembers(getIssuerListMembersRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if end is invalid", async () => {
      getIssuerListMembersRequest = new GetIssuerListMembersRequest({
        ...GetIssuerListMembersRequestFixture.create({
          end: -1,
        }),
      });

      await expect(SsiManagement.getIssuerListMembers(getIssuerListMembersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("isIssuer", () => {
    isIssuerRequest = new IsIssuerRequest(IsIssuerRequestFixture.create());

    const expectedResponse = {
      payload: true,
    };
    it("should check is issuer successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await SsiManagement.isIssuer(isIssuerRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsIssuerRequest", isIssuerRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsIssuerQuery(isIssuerRequest.securityId, isIssuerRequest.issuerId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(SsiManagement.isIssuer(isIssuerRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("IsIssuerRequest", isIssuerRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsIssuerQuery(isIssuerRequest.securityId, isIssuerRequest.issuerId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isIssuerRequest = new IsIssuerRequest({
        ...IsIssuerRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(SsiManagement.isIssuer(isIssuerRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if issuerId is invalid", async () => {
      isIssuerRequest = new IsIssuerRequest({
        ...IsIssuerRequestFixture.create({
          issuerId: "invalid",
        }),
      });

      await expect(SsiManagement.isIssuer(isIssuerRequest)).rejects.toThrow(ValidationError);
    });
  });
});
