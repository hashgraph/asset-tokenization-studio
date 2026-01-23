// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ValidationService from "@service/validation/ValidationService";
import { ErrorCode } from "@core/error/BaseError";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { RecoveryAddressCommand, RecoveryAddressCommandResponse } from "./RecoveryAddressCommand";
import { RecoveryAddressCommandHandler } from "./RecoveryAddressCommandHandler";
import { RecoveryAddressCommandFixture } from "@test/fixtures/recovery/RecoveryFixture";
import { RecoveryAddressCommandError } from "./error/RecoveryAddressCommandError";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import Account from "@domain/context/account/Account";
import ContractService from "@service/contract/ContractService";

describe("RecoveryAddressCommandHandler", () => {
  let handler: RecoveryAddressCommandHandler;
  let command: RecoveryAddressCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new RecoveryAddressCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = RecoveryAddressCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws RecoveryAddressCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        accountServiceMock.getAccountEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(RecoveryAddressCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while recovering address: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully recover address", async () => {
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().recoveryAddress.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(RecoveryAddressCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.lostWalletId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(2, command.newWalletId);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._AGENT_ROLE,
          account.id.toString(),
          command.securityId,
        );

        expect(transactionServiceMock.getHandler().recoveryAddress).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().recoveryAddress).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          evmAddress,
          command.securityId,
        );
      });
    });
  });
});
