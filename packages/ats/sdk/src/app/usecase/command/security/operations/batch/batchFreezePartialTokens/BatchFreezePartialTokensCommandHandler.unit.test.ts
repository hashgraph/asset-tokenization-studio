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
import { BatchFreezePartialTokensCommandError } from "./error/BatchFreezePartialTokensCommandError";
import { BatchFreezePartialTokensCommand, BatchFreezePartialTokensResponse } from "./BatchFreezePartialTokensCommand";
import { BatchFreezePartialTokensCommandHandler } from "./BatchFreezePartialTokensCommandHandler";

import BigDecimal from "@domain/context/shared/BigDecimal";
import SecurityService from "@service/security/SecurityService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { BatchFreezePartialTokensCommandFixture } from "@test/fixtures/batch/BatchFixture";

describe("BatchFreezePartialTokensCommandHandler", () => {
  let handler: BatchFreezePartialTokensCommandHandler;
  let command: BatchFreezePartialTokensCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new BatchFreezePartialTokensCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = BatchFreezePartialTokensCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws BatchFreezePartialTokensCommandError when command fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(command);

      await expect(resultPromise).rejects.toBeInstanceOf(BatchFreezePartialTokensCommandError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while batch freeze partial tokens: ${errorMsg}`),
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
      securityServiceMock.get.mockResolvedValue(security);
      transactionServiceMock.getHandler().batchFreezePartialTokens.mockResolvedValue({
        id: transactionId,
      });

      const result = await handler.execute(command);

      expect(result).toBeInstanceOf(BatchFreezePartialTokensResponse);
      expect(result.payload).toBe(true);
      expect(result.transactionId).toBe(transactionId);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
      expect(validationServiceMock.checkClearingDeactivated).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(transactionServiceMock.getHandler().batchFreezePartialTokens).toHaveBeenCalledTimes(1);

      expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);

      expect(transactionServiceMock.getHandler().batchFreezePartialTokens).toHaveBeenCalledWith(
        evmAddress,
        [BigDecimal.fromString(command.amountList[0], security.decimals)],
        [evmAddress],
        command.securityId,
      );
    });
  });
});
