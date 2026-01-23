// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  ActivateClearingRequest,
  ApproveClearingOperationByPartitionRequest,
  CancelClearingOperationByPartitionRequest,
  ClearingCreateHoldByPartitionRequest,
  ClearingCreateHoldFromByPartitionRequest,
  ClearingRedeemByPartitionRequest,
  ClearingRedeemFromByPartitionRequest,
  ClearingTransferByPartitionRequest,
  ClearingTransferFromByPartitionRequest,
  DeactivateClearingRequest,
  GetClearedAmountForByPartitionRequest,
  GetClearedAmountForRequest,
  GetClearingCountForByPartitionRequest,
  GetClearingCreateHoldForByPartitionRequest,
  GetClearingRedeemForByPartitionRequest,
  GetClearingsIdForByPartitionRequest,
  GetClearingTransferForByPartitionRequest,
  IsClearingActivatedRequest,
  OperatorClearingCreateHoldByPartitionRequest,
  OperatorClearingRedeemByPartitionRequest,
  OperatorClearingTransferByPartitionRequest,
  ProtectedClearingCreateHoldByPartitionRequest,
  ProtectedClearingRedeemByPartitionRequest,
  ProtectedClearingTransferByPartitionRequest,
  ReclaimClearingOperationByPartitionRequest,
} from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import {
  ActivateClearingRequestFixture,
  ApproveClearingOperationByPartitionRequestFixture,
  CancelClearingOperationByPartitionRequestFixture,
  ClearingCreateHoldByPartitionRequestFixture,
  ClearingCreateHoldFromByPartitionRequestFixture,
  ClearingHoldCreationFixture,
  ClearingRedeemByPartitionRequestFixture,
  ClearingRedeemFixture,
  ClearingRedeemFromByPartitionRequestFixture,
  ClearingTransferByPartitionRequestFixture,
  ClearingTransferFixture,
  ClearingTransferFromByPartitionRequestFixture,
  DeactivateClearingRequestFixture,
  GetClearedAmountForByPartitionRequestFixture,
  GetClearedAmountForRequestFixture,
  GetClearingCountForByPartitionRequestFixture,
  GetClearingCreateHoldForByPartitionRequestFixture,
  GetClearingRedeemForByPartitionRequestFixture,
  GetClearingsIdForByPartitionRequestFixture,
  GetClearingTransferForByPartitionRequestFixture,
  IsClearingActivatedRequestFixture,
  OperatorClearingCreateHoldByPartitionRequestFixture,
  OperatorClearingRedeemByPartitionRequestFixture,
  OperatorClearingTransferByPartitionRequestFixture,
  ProtectedClearingCreateHoldByPartitionRequestFixture,
  ProtectedClearingRedeemByPartitionRequestFixture,
  ProtectedClearingTransferByPartitionRequestFixture,
  ReclaimClearingOperationByPartitionRequestFixture,
} from "@test/fixtures/clearing/ClearingFixture";
import { ActivateClearingCommand } from "@command/security/operations/clearing/activateClearing/ActivateClearingCommand";
import { DeactivateClearingCommand } from "@command/security/operations/clearing/deactivateClearing/DeactivateClearingCommand";
import { ClearingTransferByPartitionCommand } from "@command/security/operations/clearing/clearingTransferByPartition/ClearingTransferByPartitionCommand";
import { ClearingTransferFromByPartitionCommand } from "@command/security/operations/clearing/clearingTransferFromByPartition/ClearingTransferFromByPartitionCommand";
import { CancelClearingOperationByPartitionCommand } from "@command/security/operations/clearing/cancelClearingOperationByPartition/CancelClearingOperationByPartitionCommand";
import { ReclaimClearingOperationByPartitionCommand } from "@command/security/operations/clearing/reclaimClearingOperationByPartition/ReclaimClearingOperationByPartitionCommand";
import { ClearingRedeemByPartitionCommand } from "@command/security/operations/clearing/clearingRedeemByPartition/ClearingRedeemByPartitionCommand";
import { ProtectedClearingRedeemByPartitionCommand } from "@command/security/operations/clearing/protectedClearingRedeemByPartition/ProtectedClearingRedeemByPartitionCommand";
import { ClearingCreateHoldByPartitionCommand } from "@command/security/operations/clearing/clearingCreateHoldByPartition/ClearingCreateHoldByPartitionCommand";
import { ClearingCreateHoldFromByPartitionCommand } from "@command/security/operations/clearing/clearingCreateHoldFromByPartition/ClearingCreateHoldFromByPartitionCommand";
import { ProtectedClearingCreateHoldByPartitionCommand } from "@command/security/operations/clearing/protectedClearingCreateHoldByPartition/ProtectedClearingCreateHoldByPartitionCommand";
import { GetClearedAmountForQuery } from "@query/security/clearing/getClearedAmountFor/GetClearedAmountForQuery";
import { GetClearedAmountForByPartitionQuery } from "@query/security/clearing/getClearedAmountForByPartition/GetClearedAmountForByPartitionQuery";
import { GetClearingCountForByPartitionQuery } from "@query/security/clearing/getClearingCountForByPartition/GetClearingCountForByPartitionQuery";
import { GetClearingCreateHoldForByPartitionQuery } from "@query/security/clearing/getClearingCreateHoldForByPartition/GetClearingCreateHoldForByPartitionQuery";
import { GetClearingRedeemForByPartitionQuery } from "@query/security/clearing/getClearingRedeemForByPartition/GetClearingRedeemForByPartitionQuery";
import { GetClearingTransferForByPartitionQuery } from "@query/security/clearing/getClearingTransferForByPartition/GetClearingTransferForByPartitionQuery";
import { GetClearingsIdForByPartitionQuery } from "@query/security/clearing/getClearingsIdForByPartition/GetClearingsIdForByPartitionQuery";
import { IsClearingActivatedQuery } from "@query/security/clearing/isClearingActivated/IsClearingActivatedQuery";
import { OperatorClearingCreateHoldByPartitionCommand } from "@command/security/operations/clearing/operatorClearingCreateHoldByPartition/OperatorClearingCreateHoldByPartitionCommand";
import { OperatorClearingRedeemByPartitionCommand } from "@command/security/operations/clearing/operatorClearingRedeemByPartition/OperatorClearingRedeemByPartitionCommand";
import { OperatorClearingTransferByPartitionCommand } from "@command/security/operations/clearing/operatorClearingTransferByPartition/OperatorClearingTransferByPartitionCommand";
import { ClearingRedeemFromByPartitionCommand } from "@command/security/operations/clearing/clearingRedeemFromByPartition/ClearingRedeemFromByPartitionCommand";
import { ProtectedClearingTransferByPartitionCommand } from "@command/security/operations/clearing/protectedClearingTransferByPartition/ProtectedClearingTransferByPartitionCommand";
import { ApproveClearingOperationByPartitionCommand } from "@command/security/operations/clearing/approveClearingOperationByPartition/ApproveClearingOperationByPartitionCommand";

describe("Clearing", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let activateClearingRequest: ActivateClearingRequest;
  let deactivateClearingRequest: DeactivateClearingRequest;
  let clearingTransferByPartitionRequest: ClearingTransferByPartitionRequest;
  let clearingTransferFromByPartitionRequest: ClearingTransferFromByPartitionRequest;
  let protectedClearingTransferByPartitionRequest: ProtectedClearingTransferByPartitionRequest;
  let approveClearingOperationByPartitionRequest: ApproveClearingOperationByPartitionRequest;
  let cancelClearingOperationByPartitionRequest: CancelClearingOperationByPartitionRequest;
  let reclaimClearingOperationByPartitionRequest: ReclaimClearingOperationByPartitionRequest;
  let clearingRedeemByPartitionRequest: ClearingRedeemByPartitionRequest;
  let clearingRedeemFromByPartitionRequest: ClearingRedeemFromByPartitionRequest;
  let protectedClearingRedeemByPartitionRequest: ProtectedClearingRedeemByPartitionRequest;
  let clearingCreateHoldByPartitionRequest: ClearingCreateHoldByPartitionRequest;
  let clearingCreateHoldFromByPartitionRequest: ClearingCreateHoldFromByPartitionRequest;
  let protectedClearingCreateHoldByPartitionRequest: ProtectedClearingCreateHoldByPartitionRequest;
  let getClearedAmountForRequest: GetClearedAmountForRequest;
  let getClearedAmountForByPartitionRequest: GetClearedAmountForByPartitionRequest;
  let getClearingCountForByPartitionRequest: GetClearingCountForByPartitionRequest;
  let getClearingCreateHoldForByPartitionRequest: GetClearingCreateHoldForByPartitionRequest;
  let getClearingRedeemForByPartitionRequest: GetClearingRedeemForByPartitionRequest;
  let getClearingTransferForByPartitionRequest: GetClearingTransferForByPartitionRequest;
  let getClearingsIdForByPartitionRequest: GetClearingsIdForByPartitionRequest;
  let isClearingActivatedRequest: IsClearingActivatedRequest;
  let operatorClearingCreateHoldByPartitionRequest: OperatorClearingCreateHoldByPartitionRequest;
  let operatorClearingRedeemByPartitionRequest: OperatorClearingRedeemByPartitionRequest;
  let operatorClearingTransferByPartitionRequest: OperatorClearingTransferByPartitionRequest;

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

  describe("activateClearing", () => {
    activateClearingRequest = new ActivateClearingRequest(ActivateClearingRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should activate clearing successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.activateClearing(activateClearingRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ActivateClearingRequest", activateClearingRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ActivateClearingCommand(activateClearingRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.activateClearing(activateClearingRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ActivateClearingRequest", activateClearingRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ActivateClearingCommand(activateClearingRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      activateClearingRequest = new ActivateClearingRequest({
        ...ActivateClearingRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.activateClearing(activateClearingRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("deactivateClearing", () => {
    deactivateClearingRequest = new DeactivateClearingRequest(DeactivateClearingRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should deactivate clearing successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.deactivateClearing(deactivateClearingRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("DeactivateClearingRequest", deactivateClearingRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new DeactivateClearingCommand(deactivateClearingRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.deactivateClearing(deactivateClearingRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("DeactivateClearingRequest", deactivateClearingRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new DeactivateClearingCommand(deactivateClearingRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      deactivateClearingRequest = new DeactivateClearingRequest({
        ...DeactivateClearingRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.deactivateClearing(deactivateClearingRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("clearingTransferByPartition", () => {
    clearingTransferByPartitionRequest = new ClearingTransferByPartitionRequest(
      ClearingTransferByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should execute clearing transfer successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.clearingTransferByPartition(clearingTransferByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingTransferByPartitionRequest",
        clearingTransferByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingTransferByPartitionCommand(
          clearingTransferByPartitionRequest.securityId,
          clearingTransferByPartitionRequest.partitionId,
          clearingTransferByPartitionRequest.amount,
          clearingTransferByPartitionRequest.targetId,
          clearingTransferByPartitionRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.clearingTransferByPartition(clearingTransferByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingTransferByPartitionRequest",
        clearingTransferByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingTransferByPartitionCommand(
          clearingTransferByPartitionRequest.securityId,
          clearingTransferByPartitionRequest.partitionId,
          clearingTransferByPartitionRequest.amount,
          clearingTransferByPartitionRequest.targetId,
          clearingTransferByPartitionRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ClearingTransferByPartitionRequest({
        ...ClearingTransferByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.clearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ClearingTransferByPartitionRequest({
        ...ClearingTransferByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.clearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new ClearingTransferByPartitionRequest({
        ...ClearingTransferByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.clearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if expirationDate is invalid", async () => {
      const invalidRequest = new ClearingTransferByPartitionRequest({
        ...ClearingTransferByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.clearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("clearingTransferFromByPartition", () => {
    clearingTransferFromByPartitionRequest = new ClearingTransferFromByPartitionRequest(
      ClearingTransferFromByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should execute clearing transfer from successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.clearingTransferFromByPartition(clearingTransferFromByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingTransferFromByPartitionRequest",
        clearingTransferFromByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingTransferFromByPartitionCommand(
          clearingTransferFromByPartitionRequest.securityId,
          clearingTransferFromByPartitionRequest.partitionId,
          clearingTransferFromByPartitionRequest.amount,
          clearingTransferFromByPartitionRequest.sourceId,
          clearingTransferFromByPartitionRequest.targetId,
          clearingTransferFromByPartitionRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.clearingTransferFromByPartition(clearingTransferFromByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingTransferFromByPartitionRequest",
        clearingTransferFromByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingTransferFromByPartitionCommand(
          clearingTransferFromByPartitionRequest.securityId,
          clearingTransferFromByPartitionRequest.partitionId,
          clearingTransferFromByPartitionRequest.amount,
          clearingTransferFromByPartitionRequest.sourceId,
          clearingTransferFromByPartitionRequest.targetId,
          clearingTransferFromByPartitionRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ClearingTransferFromByPartitionRequest({
        ...ClearingTransferFromByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.clearingTransferFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ClearingTransferFromByPartitionRequest({
        ...ClearingTransferFromByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.clearingTransferFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new ClearingTransferFromByPartitionRequest({
        ...ClearingTransferFromByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.clearingTransferFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if sourceId is invalid", async () => {
      const invalidRequest = new ClearingTransferFromByPartitionRequest({
        ...ClearingTransferFromByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.clearingTransferFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if expirationDate is invalid", async () => {
      const invalidRequest = new ClearingTransferFromByPartitionRequest({
        ...ClearingTransferFromByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.clearingTransferFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("cancelClearingOperationByPartition", () => {
    cancelClearingOperationByPartitionRequest = new CancelClearingOperationByPartitionRequest(
      CancelClearingOperationByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: true, transactionId };

    it("should cancel clearing operation successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.cancelClearingOperationByPartition(cancelClearingOperationByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "CancelClearingOperationByPartitionRequest",
        cancelClearingOperationByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CancelClearingOperationByPartitionCommand(
          cancelClearingOperationByPartitionRequest.securityId,
          cancelClearingOperationByPartitionRequest.partitionId,
          cancelClearingOperationByPartitionRequest.targetId,
          cancelClearingOperationByPartitionRequest.clearingId,
          cancelClearingOperationByPartitionRequest.clearingOperationType,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.cancelClearingOperationByPartition(cancelClearingOperationByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "CancelClearingOperationByPartitionRequest",
        cancelClearingOperationByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CancelClearingOperationByPartitionCommand(
          cancelClearingOperationByPartitionRequest.securityId,
          cancelClearingOperationByPartitionRequest.partitionId,
          cancelClearingOperationByPartitionRequest.targetId,
          cancelClearingOperationByPartitionRequest.clearingId,
          cancelClearingOperationByPartitionRequest.clearingOperationType,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new CancelClearingOperationByPartitionRequest({
        ...CancelClearingOperationByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.cancelClearingOperationByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new CancelClearingOperationByPartitionRequest({
        ...CancelClearingOperationByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.cancelClearingOperationByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if clearingId is invalid", async () => {
      const invalidRequest = new CancelClearingOperationByPartitionRequest({
        ...CancelClearingOperationByPartitionRequestFixture.create({
          clearingId: -1,
        }),
      });

      await expect(Security.cancelClearingOperationByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("reclaimClearingOperationByPartition", () => {
    reclaimClearingOperationByPartitionRequest = new ReclaimClearingOperationByPartitionRequest(
      ReclaimClearingOperationByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: true, transactionId };

    it("should reclaim clearing operation successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.reclaimClearingOperationByPartition(reclaimClearingOperationByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ReclaimClearingOperationByPartitionRequest",
        reclaimClearingOperationByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ReclaimClearingOperationByPartitionCommand(
          reclaimClearingOperationByPartitionRequest.securityId,
          reclaimClearingOperationByPartitionRequest.partitionId,
          reclaimClearingOperationByPartitionRequest.targetId,
          reclaimClearingOperationByPartitionRequest.clearingId,
          reclaimClearingOperationByPartitionRequest.clearingOperationType,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.reclaimClearingOperationByPartition(reclaimClearingOperationByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ReclaimClearingOperationByPartitionRequest",
        reclaimClearingOperationByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ReclaimClearingOperationByPartitionCommand(
          reclaimClearingOperationByPartitionRequest.securityId,
          reclaimClearingOperationByPartitionRequest.partitionId,
          reclaimClearingOperationByPartitionRequest.targetId,
          reclaimClearingOperationByPartitionRequest.clearingId,
          reclaimClearingOperationByPartitionRequest.clearingOperationType,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ReclaimClearingOperationByPartitionRequest({
        ...ReclaimClearingOperationByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.reclaimClearingOperationByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ReclaimClearingOperationByPartitionRequest({
        ...ReclaimClearingOperationByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.reclaimClearingOperationByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if clearingId is invalid", async () => {
      const invalidRequest = new ReclaimClearingOperationByPartitionRequest({
        ...ReclaimClearingOperationByPartitionRequestFixture.create({
          clearingId: -1,
        }),
      });

      await expect(Security.reclaimClearingOperationByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("clearingRedeemByPartition", () => {
    clearingRedeemByPartitionRequest = new ClearingRedeemByPartitionRequest(
      ClearingRedeemByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should execute clearing redeem successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.clearingRedeemByPartition(clearingRedeemByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingRedeemByPartitionRequest",
        clearingRedeemByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingRedeemByPartitionCommand(
          clearingRedeemByPartitionRequest.securityId,
          clearingRedeemByPartitionRequest.partitionId,
          clearingRedeemByPartitionRequest.amount,
          clearingRedeemByPartitionRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.clearingRedeemByPartition(clearingRedeemByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingRedeemByPartitionRequest",
        clearingRedeemByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingRedeemByPartitionCommand(
          clearingRedeemByPartitionRequest.securityId,
          clearingRedeemByPartitionRequest.partitionId,
          clearingRedeemByPartitionRequest.amount,
          clearingRedeemByPartitionRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ClearingRedeemByPartitionRequest({
        ...ClearingRedeemByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.clearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ClearingRedeemByPartitionRequest({
        ...ClearingRedeemByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.clearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new ClearingRedeemByPartitionRequest({
        ...ClearingRedeemByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.clearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if expirationDate is invalid", async () => {
      const invalidRequest = new ClearingRedeemByPartitionRequest({
        ...ClearingRedeemByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.clearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("protectedClearingRedeemByPartition", () => {
    protectedClearingRedeemByPartitionRequest = new ProtectedClearingRedeemByPartitionRequest(
      ProtectedClearingRedeemByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should execute protected clearing redeem successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.protectedClearingRedeemByPartition(protectedClearingRedeemByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedClearingRedeemByPartitionRequest",
        protectedClearingRedeemByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedClearingRedeemByPartitionCommand(
          protectedClearingRedeemByPartitionRequest.securityId,
          protectedClearingRedeemByPartitionRequest.partitionId,
          protectedClearingRedeemByPartitionRequest.amount,
          protectedClearingRedeemByPartitionRequest.sourceId,
          protectedClearingRedeemByPartitionRequest.expirationDate,
          protectedClearingRedeemByPartitionRequest.deadline,
          protectedClearingRedeemByPartitionRequest.nonce,
          protectedClearingRedeemByPartitionRequest.signature,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.protectedClearingRedeemByPartition(protectedClearingRedeemByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedClearingRedeemByPartitionRequest",
        protectedClearingRedeemByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedClearingRedeemByPartitionCommand(
          protectedClearingRedeemByPartitionRequest.securityId,
          protectedClearingRedeemByPartitionRequest.partitionId,
          protectedClearingRedeemByPartitionRequest.amount,
          protectedClearingRedeemByPartitionRequest.sourceId,
          protectedClearingRedeemByPartitionRequest.expirationDate,
          protectedClearingRedeemByPartitionRequest.deadline,
          protectedClearingRedeemByPartitionRequest.nonce,
          protectedClearingRedeemByPartitionRequest.signature,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ProtectedClearingRedeemByPartitionRequest({
        ...ProtectedClearingRedeemByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.protectedClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ProtectedClearingRedeemByPartitionRequest({
        ...ProtectedClearingRedeemByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.protectedClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new ProtectedClearingRedeemByPartitionRequest({
        ...ProtectedClearingRedeemByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.protectedClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if sourceId is invalid", async () => {
      const invalidRequest = new ProtectedClearingRedeemByPartitionRequest({
        ...ProtectedClearingRedeemByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.protectedClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if expirationDate is invalid", async () => {
      const invalidRequest = new ProtectedClearingRedeemByPartitionRequest({
        ...ProtectedClearingRedeemByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.protectedClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("clearingCreateHoldByPartition", () => {
    clearingCreateHoldByPartitionRequest = new ClearingCreateHoldByPartitionRequest(
      ClearingCreateHoldByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should create hold successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.clearingCreateHoldByPartition(clearingCreateHoldByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingCreateHoldByPartitionRequest",
        clearingCreateHoldByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingCreateHoldByPartitionCommand(
          clearingCreateHoldByPartitionRequest.securityId,
          clearingCreateHoldByPartitionRequest.partitionId,
          clearingCreateHoldByPartitionRequest.escrowId,
          clearingCreateHoldByPartitionRequest.amount,
          clearingCreateHoldByPartitionRequest.targetId,
          clearingCreateHoldByPartitionRequest.clearingExpirationDate,
          clearingCreateHoldByPartitionRequest.holdExpirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.clearingCreateHoldByPartition(clearingCreateHoldByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingCreateHoldByPartitionRequest",
        clearingCreateHoldByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingCreateHoldByPartitionCommand(
          clearingCreateHoldByPartitionRequest.securityId,
          clearingCreateHoldByPartitionRequest.partitionId,
          clearingCreateHoldByPartitionRequest.escrowId,
          clearingCreateHoldByPartitionRequest.amount,
          clearingCreateHoldByPartitionRequest.targetId,
          clearingCreateHoldByPartitionRequest.clearingExpirationDate,
          clearingCreateHoldByPartitionRequest.holdExpirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldByPartitionRequest({
        ...ClearingCreateHoldByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.clearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldByPartitionRequest({
        ...ClearingCreateHoldByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.clearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldByPartitionRequest({
        ...ClearingCreateHoldByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.clearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if escrowId is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldByPartitionRequest({
        ...ClearingCreateHoldByPartitionRequestFixture.create({
          escrowId: "invalid",
        }),
      });

      await expect(Security.clearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if clearingExpirationDate is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldByPartitionRequest({
        ...ClearingCreateHoldByPartitionRequestFixture.create({
          clearingExpirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.clearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("clearingCreateHoldFromByPartition", () => {
    clearingCreateHoldFromByPartitionRequest = new ClearingCreateHoldFromByPartitionRequest(
      ClearingCreateHoldFromByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should create hold from successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.clearingCreateHoldFromByPartition(clearingCreateHoldFromByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingCreateHoldFromByPartitionRequest",
        clearingCreateHoldFromByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingCreateHoldFromByPartitionCommand(
          clearingCreateHoldFromByPartitionRequest.securityId,
          clearingCreateHoldFromByPartitionRequest.partitionId,
          clearingCreateHoldFromByPartitionRequest.escrowId,
          clearingCreateHoldFromByPartitionRequest.amount,
          clearingCreateHoldFromByPartitionRequest.sourceId,
          clearingCreateHoldFromByPartitionRequest.targetId,
          clearingCreateHoldFromByPartitionRequest.clearingExpirationDate,
          clearingCreateHoldFromByPartitionRequest.holdExpirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.clearingCreateHoldFromByPartition(clearingCreateHoldFromByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingCreateHoldFromByPartitionRequest",
        clearingCreateHoldFromByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingCreateHoldFromByPartitionCommand(
          clearingCreateHoldFromByPartitionRequest.securityId,
          clearingCreateHoldFromByPartitionRequest.partitionId,
          clearingCreateHoldFromByPartitionRequest.escrowId,
          clearingCreateHoldFromByPartitionRequest.amount,
          clearingCreateHoldFromByPartitionRequest.sourceId,
          clearingCreateHoldFromByPartitionRequest.targetId,
          clearingCreateHoldFromByPartitionRequest.clearingExpirationDate,
          clearingCreateHoldFromByPartitionRequest.holdExpirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldFromByPartitionRequest({
        ...ClearingCreateHoldFromByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.clearingCreateHoldFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldFromByPartitionRequest({
        ...ClearingCreateHoldFromByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.clearingCreateHoldFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldFromByPartitionRequest({
        ...ClearingCreateHoldFromByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.clearingCreateHoldFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if escrowId is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldFromByPartitionRequest({
        ...ClearingCreateHoldFromByPartitionRequestFixture.create({
          escrowId: "invalid",
        }),
      });

      await expect(Security.clearingCreateHoldFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if sourceId is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldFromByPartitionRequest({
        ...ClearingCreateHoldFromByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.clearingCreateHoldFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if clearingExpirationDate is invalid", async () => {
      const invalidRequest = new ClearingCreateHoldFromByPartitionRequest({
        ...ClearingCreateHoldFromByPartitionRequestFixture.create({
          clearingExpirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.clearingCreateHoldFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("protectedClearingCreateHoldByPartition", () => {
    protectedClearingCreateHoldByPartitionRequest = new ProtectedClearingCreateHoldByPartitionRequest(
      ProtectedClearingCreateHoldByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should create protected hold successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.protectedClearingCreateHoldByPartition(
        protectedClearingCreateHoldByPartitionRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedClearingCreateHoldByPartitionRequest",
        protectedClearingCreateHoldByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedClearingCreateHoldByPartitionCommand(
          protectedClearingCreateHoldByPartitionRequest.securityId,
          protectedClearingCreateHoldByPartitionRequest.partitionId,
          protectedClearingCreateHoldByPartitionRequest.escrowId,
          protectedClearingCreateHoldByPartitionRequest.amount,
          protectedClearingCreateHoldByPartitionRequest.sourceId,
          protectedClearingCreateHoldByPartitionRequest.targetId,
          protectedClearingCreateHoldByPartitionRequest.clearingExpirationDate,
          protectedClearingCreateHoldByPartitionRequest.holdExpirationDate,
          protectedClearingCreateHoldByPartitionRequest.deadline,
          protectedClearingCreateHoldByPartitionRequest.nonce,
          protectedClearingCreateHoldByPartitionRequest.signature,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.protectedClearingCreateHoldByPartition(protectedClearingCreateHoldByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedClearingCreateHoldByPartitionRequest",
        protectedClearingCreateHoldByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedClearingCreateHoldByPartitionCommand(
          protectedClearingCreateHoldByPartitionRequest.securityId,
          protectedClearingCreateHoldByPartitionRequest.partitionId,
          protectedClearingCreateHoldByPartitionRequest.escrowId,
          protectedClearingCreateHoldByPartitionRequest.amount,
          protectedClearingCreateHoldByPartitionRequest.sourceId,
          protectedClearingCreateHoldByPartitionRequest.targetId,
          protectedClearingCreateHoldByPartitionRequest.clearingExpirationDate,
          protectedClearingCreateHoldByPartitionRequest.holdExpirationDate,
          protectedClearingCreateHoldByPartitionRequest.deadline,
          protectedClearingCreateHoldByPartitionRequest.nonce,
          protectedClearingCreateHoldByPartitionRequest.signature,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ProtectedClearingCreateHoldByPartitionRequest({
        ...ProtectedClearingCreateHoldByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.protectedClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ProtectedClearingCreateHoldByPartitionRequest({
        ...ProtectedClearingCreateHoldByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.protectedClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new ProtectedClearingCreateHoldByPartitionRequest({
        ...ProtectedClearingCreateHoldByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.protectedClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if escrowId is invalid", async () => {
      const invalidRequest = new ProtectedClearingCreateHoldByPartitionRequest({
        ...ProtectedClearingCreateHoldByPartitionRequestFixture.create({
          escrowId: "invalid",
        }),
      });

      await expect(Security.protectedClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if sourceId is invalid", async () => {
      const invalidRequest = new ProtectedClearingCreateHoldByPartitionRequest({
        ...ProtectedClearingCreateHoldByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.protectedClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if clearingExpirationDate is invalid", async () => {
      const invalidRequest = new ProtectedClearingCreateHoldByPartitionRequest({
        ...ProtectedClearingCreateHoldByPartitionRequestFixture.create({
          clearingExpirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.protectedClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getClearedAmountFor", () => {
    getClearedAmountForRequest = new GetClearedAmountForRequest(GetClearedAmountForRequestFixture.create());
    const expectedResponse = { payload: 100 };

    it("should get cleared amount successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getClearedAmountFor(getClearedAmountForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearedAmountForByPartitionRequest",
        getClearedAmountForRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearedAmountForQuery(getClearedAmountForRequest.securityId, getClearedAmountForRequest.targetId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getClearedAmountFor(getClearedAmountForRequest)).rejects.toThrow("Query execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearedAmountForByPartitionRequest",
        getClearedAmountForRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearedAmountForQuery(getClearedAmountForRequest.securityId, getClearedAmountForRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new GetClearedAmountForRequest({
        ...GetClearedAmountForRequestFixture.create({ securityId: "invalid" }),
      });

      await expect(Security.getClearedAmountFor(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getClearedAmountForByPartition", () => {
    getClearedAmountForByPartitionRequest = new GetClearedAmountForByPartitionRequest(
      GetClearedAmountForByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100 };

    it("should get cleared amount by partition successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getClearedAmountForByPartition(getClearedAmountForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearedAmountForByPartitionRequest",
        getClearedAmountForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearedAmountForByPartitionQuery(
          getClearedAmountForByPartitionRequest.securityId,
          getClearedAmountForByPartitionRequest.partitionId,
          getClearedAmountForByPartitionRequest.targetId,
        ),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getClearedAmountForByPartition(getClearedAmountForByPartitionRequest)).rejects.toThrow(
        "Query execution failed",
      );
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearedAmountForByPartitionRequest",
        getClearedAmountForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearedAmountForByPartitionQuery(
          getClearedAmountForByPartitionRequest.securityId,
          getClearedAmountForByPartitionRequest.partitionId,
          getClearedAmountForByPartitionRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new GetClearedAmountForByPartitionRequest({
        ...GetClearedAmountForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getClearedAmountForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new GetClearedAmountForByPartitionRequest({
        ...GetClearedAmountForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getClearedAmountForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getClearingCountForByPartition", () => {
    getClearingCountForByPartitionRequest = new GetClearingCountForByPartitionRequest(
      GetClearingCountForByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 5 };

    it("should get clearing count successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getClearingCountForByPartition(getClearingCountForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingCountForByPartitionRequest",
        getClearingCountForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingCountForByPartitionQuery(
          getClearingCountForByPartitionRequest.securityId,
          getClearingCountForByPartitionRequest.partitionId,
          getClearingCountForByPartitionRequest.targetId,
          getClearingCountForByPartitionRequest.clearingOperationType,
        ),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getClearingCountForByPartition(getClearingCountForByPartitionRequest)).rejects.toThrow(
        "Query execution failed",
      );
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingCountForByPartitionRequest",
        getClearingCountForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingCountForByPartitionQuery(
          getClearingCountForByPartitionRequest.securityId,
          getClearingCountForByPartitionRequest.partitionId,
          getClearingCountForByPartitionRequest.targetId,
          getClearingCountForByPartitionRequest.clearingOperationType,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new GetClearingCountForByPartitionRequest({
        ...GetClearingCountForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getClearingCountForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new GetClearingCountForByPartitionRequest({
        ...GetClearingCountForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getClearingCountForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getClearingCreateHoldForByPartition", () => {
    getClearingCreateHoldForByPartitionRequest = new GetClearingCreateHoldForByPartitionRequest(
      GetClearingCreateHoldForByPartitionRequestFixture.create(),
    );
    const expectedResponse = {
      payload: ClearingHoldCreationFixture.create(),
    };

    it("should get clearing create hold successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getClearingCreateHoldForByPartition(getClearingCreateHoldForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingCreateHoldForByPartitionRequest",
        getClearingCreateHoldForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingCreateHoldForByPartitionQuery(
          getClearingCreateHoldForByPartitionRequest.securityId,
          getClearingCreateHoldForByPartitionRequest.partitionId,
          getClearingCreateHoldForByPartitionRequest.targetId,
          getClearingCreateHoldForByPartitionRequest.clearingId,
        ),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: getClearingCreateHoldForByPartitionRequest.clearingId,
          amount: expectedResponse.payload.amount.toString(),
          expirationDate: new Date(expectedResponse.payload.expirationTimestamp * ONE_THOUSAND),
          data: expectedResponse.payload.data,
          operatorData: expectedResponse.payload.operatorData,
          holdEscrowId: expectedResponse.payload.holdEscrowId,
          holdExpirationDate: new Date(expectedResponse.payload.holdExpirationTimestamp * ONE_THOUSAND),
          holdTo: expectedResponse.payload.holdTo,
          holdData: expectedResponse.payload.holdData,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.getClearingCreateHoldForByPartition(getClearingCreateHoldForByPartitionRequest),
      ).rejects.toThrow("Query execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingCreateHoldForByPartitionRequest",
        getClearingCreateHoldForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingCreateHoldForByPartitionQuery(
          getClearingCreateHoldForByPartitionRequest.securityId,
          getClearingCreateHoldForByPartitionRequest.partitionId,
          getClearingCreateHoldForByPartitionRequest.targetId,
          getClearingCreateHoldForByPartitionRequest.clearingId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new GetClearingCreateHoldForByPartitionRequest({
        ...GetClearingCreateHoldForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getClearingCreateHoldForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new GetClearingCreateHoldForByPartitionRequest({
        ...GetClearingCreateHoldForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getClearingCreateHoldForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getClearingRedeemForByPartition", () => {
    getClearingRedeemForByPartitionRequest = new GetClearingRedeemForByPartitionRequest(
      GetClearingRedeemForByPartitionRequestFixture.create(),
    );
    const expectedResponse = {
      payload: ClearingRedeemFixture.create(),
    };

    it("should get clearing redeem successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getClearingRedeemForByPartition(getClearingRedeemForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingRedeemForByPartitionRequest",
        getClearingRedeemForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingRedeemForByPartitionQuery(
          getClearingRedeemForByPartitionRequest.securityId,
          getClearingRedeemForByPartitionRequest.partitionId,
          getClearingRedeemForByPartitionRequest.targetId,
          getClearingRedeemForByPartitionRequest.clearingId,
        ),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: getClearingRedeemForByPartitionRequest.clearingId,
          amount: expectedResponse.payload.amount.toString(),
          expirationDate: new Date(expectedResponse.payload.expirationTimestamp * ONE_THOUSAND),
          data: expectedResponse.payload.data,
          operatorData: expectedResponse.payload.operatorData,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getClearingRedeemForByPartition(getClearingRedeemForByPartitionRequest)).rejects.toThrow(
        "Query execution failed",
      );
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingRedeemForByPartitionRequest",
        getClearingRedeemForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingRedeemForByPartitionQuery(
          getClearingRedeemForByPartitionRequest.securityId,
          getClearingRedeemForByPartitionRequest.partitionId,
          getClearingRedeemForByPartitionRequest.targetId,
          getClearingRedeemForByPartitionRequest.clearingId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new GetClearingRedeemForByPartitionRequest({
        ...GetClearingRedeemForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getClearingRedeemForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new GetClearingRedeemForByPartitionRequest({
        ...GetClearingRedeemForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getClearingRedeemForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getClearingTransferForByPartition", () => {
    getClearingTransferForByPartitionRequest = new GetClearingTransferForByPartitionRequest(
      GetClearingTransferForByPartitionRequestFixture.create(),
    );
    const expectedResponse = {
      payload: ClearingTransferFixture.create(),
    };

    it("should get clearing transfer successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getClearingTransferForByPartition(getClearingTransferForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingTransferForByPartitionRequest",
        getClearingTransferForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingTransferForByPartitionQuery(
          getClearingTransferForByPartitionRequest.securityId,
          getClearingTransferForByPartitionRequest.partitionId,
          getClearingTransferForByPartitionRequest.targetId,
          getClearingTransferForByPartitionRequest.clearingId,
        ),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: getClearingTransferForByPartitionRequest.clearingId,
          amount: expectedResponse.payload.amount.toString(),
          expirationDate: new Date(expectedResponse.payload.expirationTimestamp * ONE_THOUSAND),
          destination: expectedResponse.payload.destination,
          data: expectedResponse.payload.data,
          operatorData: expectedResponse.payload.operatorData,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.getClearingTransferForByPartition(getClearingTransferForByPartitionRequest),
      ).rejects.toThrow("Query execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingTransferForByPartitionRequest",
        getClearingTransferForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingTransferForByPartitionQuery(
          getClearingTransferForByPartitionRequest.securityId,
          getClearingTransferForByPartitionRequest.partitionId,
          getClearingTransferForByPartitionRequest.targetId,
          getClearingTransferForByPartitionRequest.clearingId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new GetClearingTransferForByPartitionRequest({
        ...GetClearingTransferForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getClearingTransferForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new GetClearingTransferForByPartitionRequest({
        ...GetClearingTransferForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getClearingTransferForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getClearingsIdForByPartition", () => {
    getClearingsIdForByPartitionRequest = new GetClearingsIdForByPartitionRequest(
      GetClearingsIdForByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: [1, 2, 3] };

    it("should get clearings IDs successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getClearingsIdForByPartition(getClearingsIdForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingsIdForByPartitionRequest",
        getClearingsIdForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingsIdForByPartitionQuery(
          getClearingsIdForByPartitionRequest.securityId,
          getClearingsIdForByPartitionRequest.partitionId,
          getClearingsIdForByPartitionRequest.targetId,
          getClearingsIdForByPartitionRequest.clearingOperationType,
          getClearingsIdForByPartitionRequest.start,
          getClearingsIdForByPartitionRequest.end,
        ),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getClearingsIdForByPartition(getClearingsIdForByPartitionRequest)).rejects.toThrow(
        "Query execution failed",
      );
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetClearingsIdForByPartitionRequest",
        getClearingsIdForByPartitionRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetClearingsIdForByPartitionQuery(
          getClearingsIdForByPartitionRequest.securityId,
          getClearingsIdForByPartitionRequest.partitionId,
          getClearingsIdForByPartitionRequest.targetId,
          getClearingsIdForByPartitionRequest.clearingOperationType,
          getClearingsIdForByPartitionRequest.start,
          getClearingsIdForByPartitionRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new GetClearingsIdForByPartitionRequest({
        ...GetClearingsIdForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getClearingsIdForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new GetClearingsIdForByPartitionRequest({
        ...GetClearingsIdForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getClearingsIdForByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("isClearingActivated", () => {
    isClearingActivatedRequest = new IsClearingActivatedRequest(IsClearingActivatedRequestFixture.create());
    const expectedResponse = { payload: true };

    it("should check if clearing is activated successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.isClearingActivated(isClearingActivatedRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsClearingActivatedRequest", isClearingActivatedRequest);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsClearingActivatedQuery(isClearingActivatedRequest.securityId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.isClearingActivated(isClearingActivatedRequest)).rejects.toThrow("Query execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith("IsClearingActivatedRequest", isClearingActivatedRequest);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsClearingActivatedQuery(isClearingActivatedRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new IsClearingActivatedRequest({
        ...IsClearingActivatedRequestFixture.create({ securityId: "invalid" }),
      });

      await expect(Security.isClearingActivated(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("operatorClearingCreateHoldByPartition", () => {
    operatorClearingCreateHoldByPartitionRequest = new OperatorClearingCreateHoldByPartitionRequest(
      OperatorClearingCreateHoldByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should create operator hold successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.operatorClearingCreateHoldByPartition(operatorClearingCreateHoldByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "OperatorClearingCreateHoldByPartitionRequest",
        operatorClearingCreateHoldByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new OperatorClearingCreateHoldByPartitionCommand(
          operatorClearingCreateHoldByPartitionRequest.securityId,
          operatorClearingCreateHoldByPartitionRequest.partitionId,
          operatorClearingCreateHoldByPartitionRequest.escrowId,
          operatorClearingCreateHoldByPartitionRequest.amount,
          operatorClearingCreateHoldByPartitionRequest.sourceId,
          operatorClearingCreateHoldByPartitionRequest.targetId,
          operatorClearingCreateHoldByPartitionRequest.clearingExpirationDate,
          operatorClearingCreateHoldByPartitionRequest.holdExpirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.operatorClearingCreateHoldByPartition(operatorClearingCreateHoldByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "OperatorClearingCreateHoldByPartitionRequest",
        operatorClearingCreateHoldByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new OperatorClearingCreateHoldByPartitionCommand(
          operatorClearingCreateHoldByPartitionRequest.securityId,
          operatorClearingCreateHoldByPartitionRequest.partitionId,
          operatorClearingCreateHoldByPartitionRequest.escrowId,
          operatorClearingCreateHoldByPartitionRequest.amount,
          operatorClearingCreateHoldByPartitionRequest.sourceId,
          operatorClearingCreateHoldByPartitionRequest.targetId,
          operatorClearingCreateHoldByPartitionRequest.clearingExpirationDate,
          operatorClearingCreateHoldByPartitionRequest.holdExpirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new OperatorClearingCreateHoldByPartitionRequest({
        ...OperatorClearingCreateHoldByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.operatorClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new OperatorClearingCreateHoldByPartitionRequest({
        ...OperatorClearingCreateHoldByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.operatorClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new OperatorClearingCreateHoldByPartitionRequest({
        ...OperatorClearingCreateHoldByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.operatorClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if escrowId is invalid", async () => {
      const invalidRequest = new OperatorClearingCreateHoldByPartitionRequest({
        ...OperatorClearingCreateHoldByPartitionRequestFixture.create({
          escrowId: "invalid",
        }),
      });

      await expect(Security.operatorClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if sourceId is invalid", async () => {
      const invalidRequest = new OperatorClearingCreateHoldByPartitionRequest({
        ...OperatorClearingCreateHoldByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.operatorClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if clearingExpirationDate is invalid", async () => {
      const invalidRequest = new OperatorClearingCreateHoldByPartitionRequest({
        ...OperatorClearingCreateHoldByPartitionRequestFixture.create({
          clearingExpirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.operatorClearingCreateHoldByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("operatorClearingRedeemByPartition", () => {
    operatorClearingRedeemByPartitionRequest = new OperatorClearingRedeemByPartitionRequest(
      OperatorClearingRedeemByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should execute operator redeem successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.operatorClearingRedeemByPartition(operatorClearingRedeemByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "OperatorClearingRedeemByPartitionRequest",
        operatorClearingRedeemByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new OperatorClearingRedeemByPartitionCommand(
          operatorClearingRedeemByPartitionRequest.securityId,
          operatorClearingRedeemByPartitionRequest.partitionId,
          operatorClearingRedeemByPartitionRequest.amount,
          operatorClearingRedeemByPartitionRequest.sourceId,
          operatorClearingRedeemByPartitionRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.operatorClearingRedeemByPartition(operatorClearingRedeemByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "OperatorClearingRedeemByPartitionRequest",
        operatorClearingRedeemByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new OperatorClearingRedeemByPartitionCommand(
          operatorClearingRedeemByPartitionRequest.securityId,
          operatorClearingRedeemByPartitionRequest.partitionId,
          operatorClearingRedeemByPartitionRequest.amount,
          operatorClearingRedeemByPartitionRequest.sourceId,
          operatorClearingRedeemByPartitionRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new OperatorClearingRedeemByPartitionRequest({
        ...OperatorClearingRedeemByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.operatorClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new OperatorClearingRedeemByPartitionRequest({
        ...OperatorClearingRedeemByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.operatorClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new OperatorClearingRedeemByPartitionRequest({
        ...OperatorClearingRedeemByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.operatorClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if sourceId is invalid", async () => {
      const invalidRequest = new OperatorClearingRedeemByPartitionRequest({
        ...OperatorClearingRedeemByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.operatorClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if expirationDate is invalid", async () => {
      const invalidRequest = new OperatorClearingRedeemByPartitionRequest({
        ...OperatorClearingRedeemByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.operatorClearingRedeemByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("operatorClearingTransferByPartition", () => {
    operatorClearingTransferByPartitionRequest = new OperatorClearingTransferByPartitionRequest(
      OperatorClearingTransferByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should execute operator transfer successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.operatorClearingTransferByPartition(operatorClearingTransferByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "OperatorClearingTransferByPartitionRequest",
        operatorClearingTransferByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new OperatorClearingTransferByPartitionCommand(
          operatorClearingTransferByPartitionRequest.securityId,
          operatorClearingTransferByPartitionRequest.partitionId,
          operatorClearingTransferByPartitionRequest.amount,
          operatorClearingTransferByPartitionRequest.sourceId,
          operatorClearingTransferByPartitionRequest.targetId,
          operatorClearingTransferByPartitionRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.operatorClearingTransferByPartition(operatorClearingTransferByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "OperatorClearingTransferByPartitionRequest",
        operatorClearingTransferByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new OperatorClearingTransferByPartitionCommand(
          operatorClearingTransferByPartitionRequest.securityId,
          operatorClearingTransferByPartitionRequest.partitionId,
          operatorClearingTransferByPartitionRequest.amount,
          operatorClearingTransferByPartitionRequest.sourceId,
          operatorClearingTransferByPartitionRequest.targetId,
          operatorClearingTransferByPartitionRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new OperatorClearingTransferByPartitionRequest({
        ...OperatorClearingTransferByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.operatorClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new OperatorClearingTransferByPartitionRequest({
        ...OperatorClearingTransferByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.operatorClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new OperatorClearingTransferByPartitionRequest({
        ...OperatorClearingTransferByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.operatorClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if sourceId is invalid", async () => {
      const invalidRequest = new OperatorClearingTransferByPartitionRequest({
        ...OperatorClearingTransferByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.operatorClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if expirationDate is invalid", async () => {
      const invalidRequest = new OperatorClearingTransferByPartitionRequest({
        ...OperatorClearingTransferByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.operatorClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("clearingRedeemFromByPartition", () => {
    clearingRedeemFromByPartitionRequest = new ClearingRedeemFromByPartitionRequest(
      ClearingRedeemFromByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should execute clearing redeem from successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.clearingRedeemFromByPartition(clearingRedeemFromByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingRedeemFromByPartitionRequest",
        clearingRedeemFromByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingRedeemFromByPartitionCommand(
          clearingRedeemFromByPartitionRequest.securityId,
          clearingRedeemFromByPartitionRequest.partitionId,
          clearingRedeemFromByPartitionRequest.amount,
          clearingRedeemFromByPartitionRequest.sourceId,
          clearingRedeemFromByPartitionRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.clearingRedeemFromByPartition(clearingRedeemFromByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ClearingRedeemFromByPartitionRequest",
        clearingRedeemFromByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ClearingRedeemFromByPartitionCommand(
          clearingRedeemFromByPartitionRequest.securityId,
          clearingRedeemFromByPartitionRequest.partitionId,
          clearingRedeemFromByPartitionRequest.amount,
          clearingRedeemFromByPartitionRequest.sourceId,
          clearingRedeemFromByPartitionRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ClearingRedeemFromByPartitionRequest({
        ...ClearingRedeemFromByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.clearingRedeemFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ClearingRedeemFromByPartitionRequest({
        ...ClearingRedeemFromByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.clearingRedeemFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new ClearingRedeemFromByPartitionRequest({
        ...ClearingRedeemFromByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.clearingRedeemFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if sourceId is invalid", async () => {
      const invalidRequest = new ClearingRedeemFromByPartitionRequest({
        ...ClearingRedeemFromByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.clearingRedeemFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if expirationDate is invalid", async () => {
      const invalidRequest = new ClearingRedeemFromByPartitionRequest({
        ...ClearingRedeemFromByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.clearingRedeemFromByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("protectedClearingTransferByPartition", () => {
    protectedClearingTransferByPartitionRequest = new ProtectedClearingTransferByPartitionRequest(
      ProtectedClearingTransferByPartitionRequestFixture.create(),
    );
    const expectedResponse = { payload: 100, transactionId };

    it("should execute protected clearing transfer successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.protectedClearingTransferByPartition(protectedClearingTransferByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedClearingTransferByPartitionRequest",
        protectedClearingTransferByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedClearingTransferByPartitionCommand(
          protectedClearingTransferByPartitionRequest.securityId,
          protectedClearingTransferByPartitionRequest.partitionId,
          protectedClearingTransferByPartitionRequest.amount,
          protectedClearingTransferByPartitionRequest.sourceId,
          protectedClearingTransferByPartitionRequest.targetId,
          protectedClearingTransferByPartitionRequest.expirationDate,
          protectedClearingTransferByPartitionRequest.deadline,
          protectedClearingTransferByPartitionRequest.nonce,
          protectedClearingTransferByPartitionRequest.signature,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.protectedClearingTransferByPartition(protectedClearingTransferByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedClearingTransferByPartitionRequest",
        protectedClearingTransferByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedClearingTransferByPartitionCommand(
          protectedClearingTransferByPartitionRequest.securityId,
          protectedClearingTransferByPartitionRequest.partitionId,
          protectedClearingTransferByPartitionRequest.amount,
          protectedClearingTransferByPartitionRequest.sourceId,
          protectedClearingTransferByPartitionRequest.targetId,
          protectedClearingTransferByPartitionRequest.expirationDate,
          protectedClearingTransferByPartitionRequest.deadline,
          protectedClearingTransferByPartitionRequest.nonce,
          protectedClearingTransferByPartitionRequest.signature,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ProtectedClearingTransferByPartitionRequest({
        ...ProtectedClearingTransferByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.protectedClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ProtectedClearingTransferByPartitionRequest({
        ...ProtectedClearingTransferByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.protectedClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      const invalidRequest = new ProtectedClearingTransferByPartitionRequest({
        ...ProtectedClearingTransferByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.protectedClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if sourceId is invalid", async () => {
      const invalidRequest = new ProtectedClearingTransferByPartitionRequest({
        ...ProtectedClearingTransferByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.protectedClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if expirationDate is invalid", async () => {
      const invalidRequest = new ProtectedClearingTransferByPartitionRequest({
        ...ProtectedClearingTransferByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.protectedClearingTransferByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("approveClearingOperationByPartition", () => {
    approveClearingOperationByPartitionRequest = new ApproveClearingOperationByPartitionRequest(
      ApproveClearingOperationByPartitionRequestFixture.create(),
    );
    const transactionId = "tx123";
    const expectedResponse = { payload: true, transactionId };

    it("should approve clearing operation successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.approveClearingOperationByPartition(approveClearingOperationByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ApproveClearingOperationByPartitionRequest",
        approveClearingOperationByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ApproveClearingOperationByPartitionCommand(
          approveClearingOperationByPartitionRequest.securityId,
          approveClearingOperationByPartitionRequest.partitionId,
          approveClearingOperationByPartitionRequest.targetId,
          approveClearingOperationByPartitionRequest.clearingId,
          approveClearingOperationByPartitionRequest.clearingOperationType,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        Security.approveClearingOperationByPartition(approveClearingOperationByPartitionRequest),
      ).rejects.toThrow("Command execution failed");
      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ApproveClearingOperationByPartitionRequest",
        approveClearingOperationByPartitionRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ApproveClearingOperationByPartitionCommand(
          approveClearingOperationByPartitionRequest.securityId,
          approveClearingOperationByPartitionRequest.partitionId,
          approveClearingOperationByPartitionRequest.targetId,
          approveClearingOperationByPartitionRequest.clearingId,
          approveClearingOperationByPartitionRequest.clearingOperationType,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new ApproveClearingOperationByPartitionRequest({
        ...ApproveClearingOperationByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.approveClearingOperationByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      const invalidRequest = new ApproveClearingOperationByPartitionRequest({
        ...ApproveClearingOperationByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.approveClearingOperationByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if clearingId is invalid", async () => {
      const invalidRequest = new ApproveClearingOperationByPartitionRequest({
        ...ApproveClearingOperationByPartitionRequestFixture.create({
          clearingId: -1,
        }),
      });

      await expect(Security.approveClearingOperationByPartition(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });
});
