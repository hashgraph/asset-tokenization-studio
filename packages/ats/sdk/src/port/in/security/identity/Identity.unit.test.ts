// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  IdentityRegistryRequest,
  OnchainIDRequest,
  SetIdentityRegistryRequest,
  SetOnchainIDRequest,
} from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { OnchainIDRequestFixture, SetOnchainIDRequestFixture } from "@test/fixtures/tokenMetadata/TokenMetadataFixture";
import { SetOnchainIDCommand } from "@command/security/operations/tokenMetadata/setOnchainID/SetOnchainIDCommand";
import {
  IdentityRegistryQueryFixture,
  SetIdentityRegistryRequestFixture,
} from "@test/fixtures/identityRegistry/IdentityRegistryFixture";
import { SetIdentityRegistryCommand } from "@command/security/identityRegistry/setIdentityRegistry/SetIdentityRegistryCommand";
import { IdentityRegistryQuery } from "@query/security/identityRegistry/IdentityRegistryQuery";
import { OnchainIDQuery } from "@query/security/tokenMetadata/onchainId/OnchainIDQuery";

describe("Identity", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let setOnchainIDRequest: SetOnchainIDRequest;
  let setIdentityRegistryRequest: SetIdentityRegistryRequest;
  let identityRegistryRequest: IdentityRegistryRequest;
  let onchainIDRequest: OnchainIDRequest;

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

  describe("SetOnchainID", () => {
    setOnchainIDRequest = new SetOnchainIDRequest(SetOnchainIDRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should set onchainID successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.setOnchainID(setOnchainIDRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetOnchainIDRequest", setOnchainIDRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetOnchainIDCommand(setOnchainIDRequest.securityId, setOnchainIDRequest.onchainID),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.setOnchainID(setOnchainIDRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetOnchainIDRequest", setOnchainIDRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetOnchainIDCommand(setOnchainIDRequest.securityId, setOnchainIDRequest.onchainID),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setOnchainIDRequest = new SetOnchainIDRequest({
        ...SetOnchainIDRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.setOnchainID(setOnchainIDRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if onchainID is invalid", async () => {
      setOnchainIDRequest = new SetOnchainIDRequest({
        ...SetOnchainIDRequestFixture.create({
          onchainID: "invalid",
        }),
      });

      await expect(Security.setOnchainID(setOnchainIDRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("SetIdentityRegistry", () => {
    setIdentityRegistryRequest = new SetIdentityRegistryRequest(SetIdentityRegistryRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should set identity registry successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.setIdentityRegistry(setIdentityRegistryRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetIdentityRegistryRequest", setIdentityRegistryRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetIdentityRegistryCommand(
          setIdentityRegistryRequest.securityId,
          setIdentityRegistryRequest.identityRegistry,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.setIdentityRegistry(setIdentityRegistryRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("SetIdentityRegistryRequest", setIdentityRegistryRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetIdentityRegistryCommand(
          setIdentityRegistryRequest.securityId,
          setIdentityRegistryRequest.identityRegistry,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setIdentityRegistryRequest = new SetIdentityRegistryRequest({
        ...SetIdentityRegistryRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.setIdentityRegistry(setIdentityRegistryRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if identityRegistry is invalid", async () => {
      setIdentityRegistryRequest = new SetIdentityRegistryRequest({
        ...SetIdentityRegistryRequestFixture.create({
          identityRegistry: "invalid",
        }),
      });

      await expect(Security.setIdentityRegistry(setIdentityRegistryRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("Identity Registry", () => {
    identityRegistryRequest = new IdentityRegistryRequest(IdentityRegistryQueryFixture.create());

    const expectedResponse = {
      payload: transactionId,
    };
    it("should get identity registry successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.identityRegistry(identityRegistryRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IdentityRegistryRequest", identityRegistryRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IdentityRegistryQuery(identityRegistryRequest.securityId));
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.identityRegistry(identityRegistryRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("IdentityRegistryRequest", identityRegistryRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IdentityRegistryQuery(identityRegistryRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      identityRegistryRequest = new IdentityRegistryRequest({
        ...IdentityRegistryQueryFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.identityRegistry(identityRegistryRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("OnchainID", () => {
    onchainIDRequest = new OnchainIDRequest(OnchainIDRequestFixture.create());

    const expectedResponse = {
      payload: transactionId,
    };
    it("should get onchanID successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.onchainID(onchainIDRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("OnchainIDRequest", onchainIDRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new OnchainIDQuery(onchainIDRequest.securityId));
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.onchainID(onchainIDRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("OnchainIDRequest", onchainIDRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new OnchainIDQuery(onchainIDRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      onchainIDRequest = new OnchainIDRequest({
        ...OnchainIDRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.onchainID(onchainIDRequest)).rejects.toThrow(ValidationError);
    });
  });
});
