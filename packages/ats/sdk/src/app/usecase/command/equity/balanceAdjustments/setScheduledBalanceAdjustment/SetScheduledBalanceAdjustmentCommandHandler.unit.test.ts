// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { SetScheduledBalanceAdjustmentCommandHandler } from "./SetScheduledBalanceAdjustmentCommandHandler";
import {
  SetScheduledBalanceAdjustmentCommand,
  SetScheduledBalanceAdjustmentCommandResponse,
} from "./SetScheduledBalanceAdjustmentCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { AccountPropsFixture, ErrorMsgFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import AccountService from "@service/account/AccountService";
import { SetScheduledBalanceAdjustmentCommandFixture } from "@test/fixtures/equity/EquityFixture";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import Account from "@domain/context/account/Account";
import { faker } from "@faker-js/faker/.";
import { SetScheduledBalanceAdjustmentCommandError } from "./error/SetScheduledBalanceAdjustmentCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("SetScheduledBalanceAdjustmentCommandHandler", () => {
  let handler: SetScheduledBalanceAdjustmentCommandHandler;
  let command: SetScheduledBalanceAdjustmentCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const validationServiceMock = createMock<ValidationService>();

  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());
  const evmAddress = new EvmAddress(account.evmAddress!);
  const errorMsg = ErrorMsgFixture.create().msg;
  const balanceAdjustmentId = "0x" + faker.number.hex(32);

  beforeEach(() => {
    handler = new SetScheduledBalanceAdjustmentCommandHandler(
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = SetScheduledBalanceAdjustmentCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetScheduledBalanceAdjustmentCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetScheduledBalanceAdjustmentCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(
            `An error occurred while setting the scheduled balance adjustment: ${errorMsg}`,
          ),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully set scheduled balance adjustment", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        validationServiceMock.checkMaturityDate.mockResolvedValue(undefined);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);

        transactionServiceMock.getHandler().setScheduledBalanceAdjustment.mockResolvedValue({
          id: transactionId,
        });

        transactionServiceMock.getTransactionResult.mockResolvedValue(balanceAdjustmentId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(SetScheduledBalanceAdjustmentCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CORPORATEACTIONS_ROLE,
          evmAddress.toString(),
          command.securityId,
        );
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
          expect.objectContaining({
            res: { id: transactionId },
            className: SetScheduledBalanceAdjustmentCommandHandler.name,
            position: 0,
            numberOfResultsItems: 1,
          }),
        );
        expect(transactionServiceMock.getHandler().setScheduledBalanceAdjustment).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().setScheduledBalanceAdjustment).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.executionDate),
          BigDecimal.fromString(command.factor),
          BigDecimal.fromString(command.decimals),
          command.securityId,
        );
        expect(result.payload).toBe(parseInt(balanceAdjustmentId, 16));
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
