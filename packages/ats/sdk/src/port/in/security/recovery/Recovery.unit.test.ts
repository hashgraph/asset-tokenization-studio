// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { IsAddressRecoveredRequest, RecoveryAddressRequest } from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { RecoveryAddressCommand } from "@command/security/operations/recoveryAddress/RecoveryAddressCommand";
import { IsAddressRecoveredQuery } from "@query/security/recovery/IsAddressRecoveredQuery";
import {
  IsAddressRecoveredRequestFixture,
  RecoveryAddressRequestFixture,
} from "@test/fixtures/recovery/RecoveryFixture";

describe("Recovery", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let recoveryAddressRequest: RecoveryAddressRequest;
  let isAddressRecoveredRequest: IsAddressRecoveredRequest;

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

  describe("RecoveryAddress", () => {
    recoveryAddressRequest = new RecoveryAddressRequest(RecoveryAddressRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should recover address successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.recoveryAddress(recoveryAddressRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RecoveryAddressRequest", recoveryAddressRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RecoveryAddressCommand(
          recoveryAddressRequest.securityId,
          recoveryAddressRequest.lostWalletId,
          recoveryAddressRequest.newWalletId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.recoveryAddress(recoveryAddressRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("RecoveryAddressRequest", recoveryAddressRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RecoveryAddressCommand(
          recoveryAddressRequest.securityId,
          recoveryAddressRequest.lostWalletId,
          recoveryAddressRequest.newWalletId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      recoveryAddressRequest = new RecoveryAddressRequest({
        ...RecoveryAddressRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.recoveryAddress(recoveryAddressRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if lostWalletId is invalid", async () => {
      recoveryAddressRequest = new RecoveryAddressRequest({
        ...RecoveryAddressRequestFixture.create({
          lostWalletId: "invalid",
        }),
      });

      await expect(Security.recoveryAddress(recoveryAddressRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if newWalletId is invalid", async () => {
      recoveryAddressRequest = new RecoveryAddressRequest({
        ...RecoveryAddressRequestFixture.create({
          newWalletId: "invalid",
        }),
      });

      await expect(Security.recoveryAddress(recoveryAddressRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("IsAddressRecovered", () => {
    isAddressRecoveredRequest = new IsAddressRecoveredRequest(IsAddressRecoveredRequestFixture.create());

    const expectedResponse = {
      payload: true,
    };
    it("should get recovered status successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.isAddressRecovered(isAddressRecoveredRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsAddressRecoveredRequest", isAddressRecoveredRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsAddressRecoveredQuery(isAddressRecoveredRequest.securityId, isAddressRecoveredRequest.targetId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.isAddressRecovered(isAddressRecoveredRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("IsAddressRecoveredRequest", isAddressRecoveredRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsAddressRecoveredQuery(isAddressRecoveredRequest.securityId, isAddressRecoveredRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isAddressRecoveredRequest = new IsAddressRecoveredRequest({
        ...IsAddressRecoveredRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.isAddressRecovered(isAddressRecoveredRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      isAddressRecoveredRequest = new IsAddressRecoveredRequest({
        ...IsAddressRecoveredRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.isAddressRecovered(isAddressRecoveredRequest)).rejects.toThrow(ValidationError);
    });
  });
});
