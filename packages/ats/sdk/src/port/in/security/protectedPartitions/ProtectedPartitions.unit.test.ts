// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { GetNounceRequest, PartitionsProtectedRequest } from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import {
  GetNounceRequestFixture,
  PartitionsProtectedRequestFixture,
} from "@test/fixtures/protectedPartitions/ProtectedPartitionsFixture";
import { PartitionsProtectedQuery } from "@query/security/protectedPartitions/arePartitionsProtected/PartitionsProtectedQuery";
import { ProtectPartitionsCommand } from "@command/security/operations/protectPartitions/ProtectPartitionsCommand";
import { UnprotectPartitionsCommand } from "@command/security/operations/unprotectPartitions/UnprotectPartitionsCommand";
import { GetNounceQuery } from "@query/security/protectedPartitions/getNounce/GetNounceQuery";

describe("Protected Partitions", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let getNounceRequest: GetNounceRequest;

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

  describe("protectPartitions", () => {
    const partitionsProtectedRequest = new PartitionsProtectedRequest(PartitionsProtectedRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should protect partitions successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.protectPartitions(partitionsProtectedRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("PartitionsProtectedRequest", partitionsProtectedRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectPartitionsCommand(partitionsProtectedRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.protectPartitions(partitionsProtectedRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("PartitionsProtectedRequest", partitionsProtectedRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectPartitionsCommand(partitionsProtectedRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const partitionsProtectedRequest = new PartitionsProtectedRequest({
        ...PartitionsProtectedRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.protectPartitions(partitionsProtectedRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("unprotectPartitions", () => {
    const partitionsProtectedRequest = new PartitionsProtectedRequest(PartitionsProtectedRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should protect partitions successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.unprotectPartitions(partitionsProtectedRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("PartitionsProtectedRequest", partitionsProtectedRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UnprotectPartitionsCommand(partitionsProtectedRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.unprotectPartitions(partitionsProtectedRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("PartitionsProtectedRequest", partitionsProtectedRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UnprotectPartitionsCommand(partitionsProtectedRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const partitionsProtectedRequest = new PartitionsProtectedRequest({
        ...PartitionsProtectedRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.unprotectPartitions(partitionsProtectedRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("arePartitionsProtected", () => {
    const partitionsProtectedRequest = new PartitionsProtectedRequest(PartitionsProtectedRequestFixture.create());

    const expectedResponse = {
      payload: true,
    };
    it("should check are partitions protected successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.arePartitionsProtected(partitionsProtectedRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("PartitionsProtectedRequest", partitionsProtectedRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new PartitionsProtectedQuery(partitionsProtectedRequest.securityId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.arePartitionsProtected(partitionsProtectedRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("PartitionsProtectedRequest", partitionsProtectedRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new PartitionsProtectedQuery(partitionsProtectedRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const partitionsProtectedRequest = new PartitionsProtectedRequest({
        ...PartitionsProtectedRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.arePartitionsProtected(partitionsProtectedRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getNounce", () => {
    getNounceRequest = new GetNounceRequest(GetNounceRequestFixture.create());

    const expectedResponse = {
      payload: 1,
    };
    it("should get nonce successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getNounce(getNounceRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetNounceRequest", getNounceRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetNounceQuery(getNounceRequest.securityId, getNounceRequest.targetId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getNounce(getNounceRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetNounceRequest", getNounceRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetNounceQuery(getNounceRequest.securityId, getNounceRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getNounceRequest = new GetNounceRequest({
        ...GetNounceRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getNounce(getNounceRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      getNounceRequest = new GetNounceRequest({
        ...GetNounceRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getNounce(getNounceRequest)).rejects.toThrow(ValidationError);
    });
  });
});
