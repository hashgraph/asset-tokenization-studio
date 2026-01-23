// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import {
  AccountPropsFixture,
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { HandleClearingOperationByPartitionCommandFixture } from "@test/fixtures/clearing/ClearingFixture";
import { CancelClearingOperationByPartitionCommandHandler } from "./CancelClearingOperationByPartitionCommandHandler";
import {
  CancelClearingOperationByPartitionCommand,
  CancelClearingOperationByPartitionCommandResponse,
} from "./CancelClearingOperationByPartitionCommand";
import { CancelClearingOperationByPartitionCommandError } from "./error/CancelClearingOperationByPartitionCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("CancelClearingOperationByPartitionCommandHandler", () => {
  let handler: CancelClearingOperationByPartitionCommandHandler;
  let command: CancelClearingOperationByPartitionCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CancelClearingOperationByPartitionCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = HandleClearingOperationByPartitionCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CancelClearingOperationByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CancelClearingOperationByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while cancelling clearing operation: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully cancel clearing", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        transactionServiceMock.getHandler().cancelClearingOperationByPartition.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CancelClearingOperationByPartitionCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().cancelClearingOperationByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CLEARING_VALIDATOR_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);

        expect(transactionServiceMock.getHandler().cancelClearingOperationByPartition).toHaveBeenCalledWith(
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
