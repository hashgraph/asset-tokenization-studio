// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  BatchForcedTransferRequest,
  BatchTransferRequest,
  ForcedTransferRequest,
  ForceTransferRequest,
  ProtectedTransferFromByPartitionRequest,
  TransferAndLockRequest,
  TransferRequest,
} from "../../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import {
  ForcedTransferRequestFixture,
  ForceTransferRequestFixture,
  TransferAndLockRequestFixture,
  TransferRequestFixture,
} from "@test/fixtures/transfer/TransferFixture";
import { TransferCommand } from "@command/security/operations/transfer/TransferCommand";
import { TransferAndLockCommand } from "@command/security/operations/transfer/TransferAndLockCommand";
import { ControllerTransferCommand } from "@command/security/operations/transfer/ControllerTransferCommand";
import { ProtectedTransferFromByPartitionRequestFixture } from "@test/fixtures/protectedPartitions/ProtectedPartitionsFixture";
import { ProtectedTransferFromByPartitionCommand } from "@command/security/operations/transfer/ProtectedTransferFromByPartitionCommand";
import {
  BatchForcedTransferResponse,
  BatchForcedTransferCommand,
} from "@command/security/operations/batch/batchForcedTransfer/BatchForcedTransferCommand";
import {
  BatchTransferResponse,
  BatchTransferCommand,
} from "@command/security/operations/batch/batchTransfer/BatchTransferCommand";
import { ForcedTransferCommand } from "@command/security/operations/transfer/ForcedTransferCommand";
import { BatchTransferRequestFixture, BatchForcedTransferRequestFixture } from "@test/fixtures/batch/BatchFixture";

describe("Transfer", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let transferRequest: TransferRequest;
  let transferAndLockRequest: TransferAndLockRequest;
  let forceTransferRequest: ForceTransferRequest;
  let forcedTransferRequest: ForcedTransferRequest;
  let protectedTransferFromByPartitionRequest: ProtectedTransferFromByPartitionRequest;
  let batchTransferRequest: BatchTransferRequest;
  let batchForcedTransferRequest: BatchForcedTransferRequest;

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

  describe("transfer", () => {
    transferRequest = new TransferRequest(TransferRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should transfer successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.transfer(transferRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("TransferRequest", transferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new TransferCommand(transferRequest.amount, transferRequest.targetId, transferRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.transfer(transferRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("TransferRequest", transferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new TransferCommand(transferRequest.amount, transferRequest.targetId, transferRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      transferRequest = new TransferRequest({
        ...TransferRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.transfer(transferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      transferRequest = new TransferRequest({
        ...TransferRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.transfer(transferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if amount is invalid", async () => {
      transferRequest = new TransferRequest({
        ...TransferRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.transfer(transferRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("transferAndLock", () => {
    transferAndLockRequest = new TransferAndLockRequest(TransferAndLockRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should transfer and lock successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.transferAndLock(transferAndLockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("TransferAndLockRequest", transferAndLockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new TransferAndLockCommand(
          transferAndLockRequest.amount,
          transferAndLockRequest.targetId,
          transferAndLockRequest.securityId,
          transferAndLockRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.transferAndLock(transferAndLockRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("TransferAndLockRequest", transferAndLockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new TransferAndLockCommand(
          transferAndLockRequest.amount,
          transferAndLockRequest.targetId,
          transferAndLockRequest.securityId,
          transferAndLockRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      transferAndLockRequest = new TransferAndLockRequest({
        ...TransferAndLockRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.transferAndLock(transferAndLockRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      transferAndLockRequest = new TransferAndLockRequest({
        ...TransferAndLockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.transferAndLock(transferAndLockRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if amount is invalid", async () => {
      transferAndLockRequest = new TransferAndLockRequest({
        ...TransferAndLockRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.transferAndLock(transferAndLockRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("controllerTransfer", () => {
    forceTransferRequest = new ForceTransferRequest(ForceTransferRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should controller transfer successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.controllerTransfer(forceTransferRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ForceTransferRequest", forceTransferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ControllerTransferCommand(
          forceTransferRequest.amount,
          forceTransferRequest.sourceId,
          forceTransferRequest.targetId,
          forceTransferRequest.securityId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.controllerTransfer(forceTransferRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ForceTransferRequest", forceTransferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ControllerTransferCommand(
          forceTransferRequest.amount,
          forceTransferRequest.sourceId,
          forceTransferRequest.targetId,
          forceTransferRequest.securityId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      forceTransferRequest = new ForceTransferRequest({
        ...ForceTransferRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.controllerTransfer(forceTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      forceTransferRequest = new ForceTransferRequest({
        ...ForceTransferRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.controllerTransfer(forceTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if sourceId is invalid", async () => {
      forceTransferRequest = new ForceTransferRequest({
        ...ForceTransferRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.controllerTransfer(forceTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if amount is invalid", async () => {
      forceTransferRequest = new ForceTransferRequest({
        ...ForceTransferRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.controllerTransfer(forceTransferRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("forcedTransfer", () => {
    forcedTransferRequest = new ForcedTransferRequest(ForcedTransferRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should forced transfer successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.forcedTransfer(forcedTransferRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ForcedTransferRequest", forcedTransferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ForcedTransferCommand(
          forcedTransferRequest.sourceId,
          forcedTransferRequest.targetId,
          forcedTransferRequest.amount,
          forcedTransferRequest.securityId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.forcedTransfer(forcedTransferRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ForcedTransferRequest", forcedTransferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ControllerTransferCommand(
          forcedTransferRequest.amount,
          forcedTransferRequest.sourceId,
          forcedTransferRequest.targetId,
          forcedTransferRequest.securityId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      forcedTransferRequest = new ForcedTransferRequest({
        ...ForcedTransferRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.forcedTransfer(forcedTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      forcedTransferRequest = new ForceTransferRequest({
        ...ForcedTransferRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.forcedTransfer(forcedTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if sourceId is invalid", async () => {
      forcedTransferRequest = new ForcedTransferRequest({
        ...ForcedTransferRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.forcedTransfer(forcedTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if amount is invalid", async () => {
      forcedTransferRequest = new ForcedTransferRequest({
        ...ForcedTransferRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.forcedTransfer(forcedTransferRequest)).rejects.toThrow(ValidationError);
    });
  });
  describe("protectedTransferFromByPartition", () => {
    protectedTransferFromByPartitionRequest = new ProtectedTransferFromByPartitionRequest(
      ProtectedTransferFromByPartitionRequestFixture.create(),
    );

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should protected transfer from by partition successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.protectedTransferFromByPartition(protectedTransferFromByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedTransferFromByPartitionRequest",
        protectedTransferFromByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedTransferFromByPartitionCommand(
          protectedTransferFromByPartitionRequest.securityId,
          protectedTransferFromByPartitionRequest.partitionId,
          protectedTransferFromByPartitionRequest.sourceId,
          protectedTransferFromByPartitionRequest.targetId,
          protectedTransferFromByPartitionRequest.amount,
          protectedTransferFromByPartitionRequest.deadline,
          protectedTransferFromByPartitionRequest.nounce,
          protectedTransferFromByPartitionRequest.signature,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.protectedTransferFromByPartition(protectedTransferFromByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedTransferFromByPartitionRequest",
        protectedTransferFromByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedTransferFromByPartitionCommand(
          protectedTransferFromByPartitionRequest.securityId,
          protectedTransferFromByPartitionRequest.partitionId,
          protectedTransferFromByPartitionRequest.sourceId,
          protectedTransferFromByPartitionRequest.targetId,
          protectedTransferFromByPartitionRequest.amount,
          protectedTransferFromByPartitionRequest.deadline,
          protectedTransferFromByPartitionRequest.nounce,
          protectedTransferFromByPartitionRequest.signature,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      protectedTransferFromByPartitionRequest = new ProtectedTransferFromByPartitionRequest({
        ...ProtectedTransferFromByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.protectedTransferFromByPartition(protectedTransferFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if partitionId is invalid", async () => {
      protectedTransferFromByPartitionRequest = new ProtectedTransferFromByPartitionRequest({
        ...ProtectedTransferFromByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.protectedTransferFromByPartition(protectedTransferFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if sourceId is invalid", async () => {
      protectedTransferFromByPartitionRequest = new ProtectedTransferFromByPartitionRequest({
        ...ProtectedTransferFromByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.protectedTransferFromByPartition(protectedTransferFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if targetId is invalid", async () => {
      protectedTransferFromByPartitionRequest = new ProtectedTransferFromByPartitionRequest({
        ...ProtectedTransferFromByPartitionRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.protectedTransferFromByPartition(protectedTransferFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if amount is invalid", async () => {
      protectedTransferFromByPartitionRequest = new ProtectedTransferFromByPartitionRequest({
        ...ProtectedTransferFromByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.protectedTransferFromByPartition(protectedTransferFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if deadline is invalid", async () => {
      protectedTransferFromByPartitionRequest = new ProtectedTransferFromByPartitionRequest({
        ...ProtectedTransferFromByPartitionRequestFixture.create({
          deadline: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.protectedTransferFromByPartition(protectedTransferFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("BatchTransfer", () => {
    batchTransferRequest = new BatchTransferRequest(BatchTransferRequestFixture.create());
    const expectedResponse = new BatchTransferResponse(true, transactionId);
    it("should batch transfer sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.batchTransfer(batchTransferRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchTransferRequest", batchTransferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchTransferCommand(
          batchTransferRequest.securityId,
          batchTransferRequest.amountList,
          batchTransferRequest.toList,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.batchTransfer(batchTransferRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchTransferRequest", batchTransferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchTransferCommand(
          batchTransferRequest.securityId,
          batchTransferRequest.amountList,
          batchTransferRequest.toList,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      batchTransferRequest = new BatchTransferRequest({
        ...BatchTransferRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.batchTransfer(batchTransferRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amountList is empty", async () => {
      batchTransferRequest = new BatchTransferRequest({
        ...BatchTransferRequestFixture.create({
          amountList: [],
        }),
      });

      await expect(Security.batchTransfer(batchTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if toList is empty", async () => {
      batchTransferRequest = new BatchTransferRequest({
        ...BatchTransferRequestFixture.create({
          toList: [],
        }),
      });

      await expect(Security.batchTransfer(batchTransferRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if list lengths are not equal", async () => {
      batchTransferRequest = new BatchTransferRequest({
        ...BatchTransferRequestFixture.create({
          toList: [HederaIdPropsFixture.create().value, HederaIdPropsFixture.create().value],
        }),
      });

      await expect(Security.batchTransfer(batchTransferRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("BatchForcedTransfer", () => {
    batchForcedTransferRequest = new BatchForcedTransferRequest(BatchForcedTransferRequestFixture.create());
    const expectedResponse = new BatchForcedTransferResponse(true, transactionId);
    it("should batch forced transfer sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.batchForcedTransfer(batchForcedTransferRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchForcedTransferRequest", batchForcedTransferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchForcedTransferCommand(
          batchForcedTransferRequest.securityId,
          batchForcedTransferRequest.amountList,
          batchForcedTransferRequest.fromList,
          batchForcedTransferRequest.toList,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.batchForcedTransfer(batchForcedTransferRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchForcedTransferRequest", batchForcedTransferRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchForcedTransferCommand(
          batchForcedTransferRequest.securityId,
          batchForcedTransferRequest.amountList,
          batchForcedTransferRequest.fromList,
          batchForcedTransferRequest.toList,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      batchForcedTransferRequest = new BatchForcedTransferRequest({
        ...BatchForcedTransferRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.batchForcedTransfer(batchForcedTransferRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amountList is empty", async () => {
      batchForcedTransferRequest = new BatchForcedTransferRequest({
        ...BatchForcedTransferRequestFixture.create({
          amountList: [],
        }),
      });

      await expect(Security.batchForcedTransfer(batchForcedTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if toList is empty", async () => {
      batchForcedTransferRequest = new BatchForcedTransferRequest({
        ...BatchForcedTransferRequestFixture.create({
          toList: [],
        }),
      });

      await expect(Security.batchForcedTransfer(batchForcedTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if fromList is empty", async () => {
      batchForcedTransferRequest = new BatchForcedTransferRequest({
        ...BatchForcedTransferRequestFixture.create({
          fromList: [],
        }),
      });

      await expect(Security.batchForcedTransfer(batchForcedTransferRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if list lengths are not equal", async () => {
      batchForcedTransferRequest = new BatchForcedTransferRequest({
        ...BatchForcedTransferRequestFixture.create({
          toList: [HederaIdPropsFixture.create().value, HederaIdPropsFixture.create().value],
        }),
      });

      await expect(Security.batchForcedTransfer(batchForcedTransferRequest)).rejects.toThrow(ValidationError);
    });
  });
});
