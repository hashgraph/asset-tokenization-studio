// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import { HandleClearingOperationByPartitionCommandFixture } from "@test/fixtures/clearing/ClearingFixture";
import { ReclaimClearingOperationByPartitionCommandHandler } from "./ReclaimClearingOperationByPartitionCommandHandler";
import {
  ReclaimClearingOperationByPartitionCommand,
  ReclaimClearingOperationByPartitionCommandResponse,
} from "./ReclaimClearingOperationByPartitionCommand";
import { ReclaimClearingOperationByPartitionCommandError } from "./error/ReclaimClearingOperationByPartitionCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("ReclaimClearingOperationByPartitionCommandHandler", () => {
  let handler: ReclaimClearingOperationByPartitionCommandHandler;
  let command: ReclaimClearingOperationByPartitionCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new ReclaimClearingOperationByPartitionCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = HandleClearingOperationByPartitionCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ReclaimClearingOperationByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ReclaimClearingOperationByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while reclaiming clearing: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully reclaim clearing", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        transactionServiceMock.getHandler().reclaimClearingOperationByPartition.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ReclaimClearingOperationByPartitionCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.targetId);
        expect(transactionServiceMock.getHandler().reclaimClearingOperationByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledWith(command.securityId);
        expect(transactionServiceMock.getHandler().reclaimClearingOperationByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          evmAddress,
          command.clearingId,
          command.clearingOperationType,
          command.securityId,
        );
      });
    });
  });
});
