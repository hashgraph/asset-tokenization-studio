// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  BurnRequest,
  BatchBurnRequest,
  ForceRedeemRequest,
  ProtectedRedeemFromByPartitionRequest,
  RedeemRequest,
} from "../../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { ForceRedeemRequestFixture, RedeemRequestFixture } from "@test/fixtures/redeem/RedeemFixture";
import { RedeemCommand } from "@command/security/operations/redeem/RedeemCommand";
import { ControllerRedeemCommand } from "@command/security/operations/redeem/ControllerRedeemCommand";
import { ProtectedRedeemFromByPartitionRequestFixture } from "@test/fixtures/protectedPartitions/ProtectedPartitionsFixture";
import { ProtectedRedeemFromByPartitionCommand } from "@command/security/operations/redeem/ProtectedRedeemFromByPartitionCommand";
import { BatchBurnResponse, BatchBurnCommand } from "@command/security/operations/batch/batchBurn/BatchBurnCommand";
import { BurnCommand } from "@command/security/operations/burn/BurnCommand";
import { BatchBurnRequestFixture } from "@test/fixtures/batch/BatchFixture";
import { BurnRequestFixture } from "@test/fixtures/burn/BurnFixture";

describe("Redeem", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let redeemRequest: RedeemRequest;
  let burnRequest: BurnRequest;
  let forceRedeemRequest: ForceRedeemRequest;
  let protectedRedeemFromByPartitionRequest: ProtectedRedeemFromByPartitionRequest;
  let batchBurnRequest: BatchBurnRequest;

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

  describe("redeem", () => {
    redeemRequest = new RedeemRequest(RedeemRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should redeem successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.redeem(redeemRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RedeemRequest", redeemRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RedeemCommand(redeemRequest.amount, redeemRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.redeem(redeemRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("RedeemRequest", redeemRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RedeemCommand(redeemRequest.amount, redeemRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      redeemRequest = new RedeemRequest({
        ...RedeemRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.redeem(redeemRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if amount is invalid", async () => {
      redeemRequest = new RedeemRequest({
        ...RedeemRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.redeem(redeemRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("burn", () => {
    burnRequest = new BurnRequest(BurnRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should burn successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.burn(burnRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("BurnRequest", burnRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BurnCommand(burnRequest.sourceId, burnRequest.amount, burnRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.burn(burnRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("BurnRequest", burnRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BurnCommand(burnRequest.sourceId, burnRequest.amount, burnRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      burnRequest = new BurnRequest({
        ...BurnRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.burn(burnRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if amount is invalid", async () => {
      burnRequest = new BurnRequest({
        ...BurnRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.burn(burnRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("controllerRedeem", () => {
    forceRedeemRequest = new ForceRedeemRequest(ForceRedeemRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should controller redeem successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.controllerRedeem(forceRedeemRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ForceRedeemRequest", forceRedeemRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ControllerRedeemCommand(
          forceRedeemRequest.amount,
          forceRedeemRequest.sourceId,
          forceRedeemRequest.securityId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.controllerRedeem(forceRedeemRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ForceRedeemRequest", forceRedeemRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ControllerRedeemCommand(
          forceRedeemRequest.amount,
          forceRedeemRequest.sourceId,
          forceRedeemRequest.securityId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      forceRedeemRequest = new ForceRedeemRequest({
        ...ForceRedeemRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.controllerRedeem(forceRedeemRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if sourceId is invalid", async () => {
      forceRedeemRequest = new ForceRedeemRequest({
        ...ForceRedeemRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.controllerRedeem(forceRedeemRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if amount is invalid", async () => {
      forceRedeemRequest = new ForceRedeemRequest({
        ...ForceRedeemRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.controllerRedeem(forceRedeemRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("protectedRedeemFromByPartition", () => {
    protectedRedeemFromByPartitionRequest = new ProtectedRedeemFromByPartitionRequest(
      ProtectedRedeemFromByPartitionRequestFixture.create(),
    );

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should protected redeem from by partition successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.protectedRedeemFromByPartition(protectedRedeemFromByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedRedeemFromByPartitionRequest",
        protectedRedeemFromByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedRedeemFromByPartitionCommand(
          protectedRedeemFromByPartitionRequest.securityId,
          protectedRedeemFromByPartitionRequest.partitionId,
          protectedRedeemFromByPartitionRequest.sourceId,
          protectedRedeemFromByPartitionRequest.amount,
          protectedRedeemFromByPartitionRequest.deadline,
          protectedRedeemFromByPartitionRequest.nounce,
          protectedRedeemFromByPartitionRequest.signature,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.protectedRedeemFromByPartition(protectedRedeemFromByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedRedeemFromByPartitionRequest",
        protectedRedeemFromByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedRedeemFromByPartitionCommand(
          protectedRedeemFromByPartitionRequest.securityId,
          protectedRedeemFromByPartitionRequest.partitionId,
          protectedRedeemFromByPartitionRequest.sourceId,
          protectedRedeemFromByPartitionRequest.amount,
          protectedRedeemFromByPartitionRequest.deadline,
          protectedRedeemFromByPartitionRequest.nounce,
          protectedRedeemFromByPartitionRequest.signature,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      protectedRedeemFromByPartitionRequest = new ProtectedRedeemFromByPartitionRequest({
        ...ProtectedRedeemFromByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.protectedRedeemFromByPartition(protectedRedeemFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if partitionId is invalid", async () => {
      protectedRedeemFromByPartitionRequest = new ProtectedRedeemFromByPartitionRequest({
        ...ProtectedRedeemFromByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.protectedRedeemFromByPartition(protectedRedeemFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if sourceId is invalid", async () => {
      protectedRedeemFromByPartitionRequest = new ProtectedRedeemFromByPartitionRequest({
        ...ProtectedRedeemFromByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.protectedRedeemFromByPartition(protectedRedeemFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if amount is invalid", async () => {
      protectedRedeemFromByPartitionRequest = new ProtectedRedeemFromByPartitionRequest({
        ...ProtectedRedeemFromByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.protectedRedeemFromByPartition(protectedRedeemFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if deadline is invalid", async () => {
      protectedRedeemFromByPartitionRequest = new ProtectedRedeemFromByPartitionRequest({
        ...ProtectedRedeemFromByPartitionRequestFixture.create({
          deadline: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.protectedRedeemFromByPartition(protectedRedeemFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("BatchBurn", () => {
    batchBurnRequest = new BatchBurnRequest(BatchBurnRequestFixture.create());
    const expectedResponse = new BatchBurnResponse(true, transactionId);
    it("should batch burn sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.batchBurn(batchBurnRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchBurnRequest", batchBurnRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchBurnCommand(batchBurnRequest.securityId, batchBurnRequest.amountList, batchBurnRequest.targetList),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.batchBurn(batchBurnRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchBurnRequest", batchBurnRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchBurnCommand(batchBurnRequest.securityId, batchBurnRequest.amountList, batchBurnRequest.targetList),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      batchBurnRequest = new BatchBurnRequest({
        ...BatchBurnRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.batchBurn(batchBurnRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amountList is empty", async () => {
      batchBurnRequest = new BatchBurnRequest({
        ...BatchBurnRequestFixture.create({
          amountList: [],
        }),
      });

      await expect(Security.batchBurn(batchBurnRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetList is empty", async () => {
      batchBurnRequest = new BatchBurnRequest({
        ...BatchBurnRequestFixture.create({
          targetList: [],
        }),
      });

      await expect(Security.batchBurn(batchBurnRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if list lengths are not equal", async () => {
      batchBurnRequest = new BatchBurnRequest({
        ...BatchBurnRequestFixture.create({
          targetList: [HederaIdPropsFixture.create().value, HederaIdPropsFixture.create().value],
        }),
      });

      await expect(Security.batchBurn(batchBurnRequest)).rejects.toThrow(ValidationError);
    });
  });
});
