// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CancelScheduledBalanceAdjustmentCommandHandler } from "./CancelScheduledBalanceAdjustmentCommandHandler";
import {
  CancelScheduledBalanceAdjustmentCommand,
  CancelScheduledBalanceAdjustmentCommandResponse,
} from "./CancelScheduledBalanceAdjustmentCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { AccountPropsFixture, ErrorMsgFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import AccountService from "@service/account/AccountService";
import { CancelScheduledBalanceAdjustmentCommandFixture } from "@test/fixtures/equity/EquityFixture";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import Account from "@domain/context/account/Account";
import { CancelScheduledBalanceAdjustmentCommandError } from "./error/CancelScheduledBalanceAdjustmentCommandError";

import { ErrorCode } from "@core/error/BaseError";

describe("CancelScheduledBalanceAdjustmentCommandHandler", () => {
  let handler: CancelScheduledBalanceAdjustmentCommandHandler;
  let command: CancelScheduledBalanceAdjustmentCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const validationServiceMock = createMock<ValidationService>();

  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());
  const evmAddress = new EvmAddress(account.evmAddress!);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CancelScheduledBalanceAdjustmentCommandHandler(
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = CancelScheduledBalanceAdjustmentCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CancelScheduledBalanceAdjustmentCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CancelScheduledBalanceAdjustmentCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(
            `An error occurred while cancelling the scheduled balance adjustment: ${errorMsg}`,
          ),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully cancel a scheduled balance adjustment", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);

        transactionServiceMock.getHandler().cancelScheduledBalanceAdjustment.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CancelScheduledBalanceAdjustmentCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CORPORATEACTIONS_ROLE,
          account.evmAddress!,
          command.securityId,
        );
        expect(transactionServiceMock.getHandler().cancelScheduledBalanceAdjustment).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().cancelScheduledBalanceAdjustment).toHaveBeenCalledWith(
          evmAddress,
          command.balanceAdjustmentId,
          command.securityId,
        );
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
