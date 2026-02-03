// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import {
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  HederaIdPropsFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import Account from "@domain/context/account/Account";

import { ErrorCode } from "@core/error/BaseError";
import { BatchSetAddressFrozenCommandError } from "./error/BatchSetAddressFrozenCommandError";
import { BatchSetAddressFrozenCommand, BatchSetAddressFrozenResponse } from "./BatchSetAddressFrozenCommand";
import { BatchSetAddressFrozenCommandHandler } from "./BatchSetAddressFrozenCommandHandler";

import { BatchSetAddressFrozenCommandFixture } from "@test/fixtures/batch/BatchFixture";

describe("BatchSetAddressFrozenCommandHandler", () => {
  let handler: BatchSetAddressFrozenCommandHandler;
  let command: BatchSetAddressFrozenCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new BatchSetAddressFrozenCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = BatchSetAddressFrozenCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws BatchSetAddressFrozenCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(BatchSetAddressFrozenCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while batch set address frozen: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtCommandError,
      });
    });

    it("should successfully batch freeze partial tokens", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
      accountServiceMock.getCurrentAccount.mockReturnValue(account);
      validationServiceMock.checkPause.mockResolvedValue(undefined);
      validationServiceMock.checkClearingDeactivated.mockResolvedValue(undefined);
      validationServiceMock.checkDecimals.mockResolvedValue(undefined);
      transactionServiceMock.getHandler().batchSetAddressFrozen.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(BatchSetAddressFrozenResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkClearingDeactivated).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().batchSetAddressFrozen).toHaveBeenCalledTimes(1);

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);

      expect(transactionServiceMock.getHandler().batchSetAddressFrozen).toHaveBeenCalledWith(
        evmAddress,
        command.freezeStatusList,
        [evmAddress],
        command.securityId,
      );
    });
  });
});
