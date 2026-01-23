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
import { ActivateClearingCommandHandler } from "./ActivateClearingCommandHandler";
import { ActivateClearingCommand, ActivateClearingCommandResponse } from "./ActivateClearingCommand";
import { SwitchClearingModeCommandFixture } from "@test/fixtures/clearing/ClearingFixture";
import { ActivateClearingCommandError } from "./error/ActivateClearingCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("ActivateClearingCommandHandler", () => {
  let handler: ActivateClearingCommandHandler;
  let command: ActivateClearingCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new ActivateClearingCommandHandler(
      transactionServiceMock,
      validationServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    command = SwitchClearingModeCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ActivateClearingCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ActivateClearingCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while activating clearing mode: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully activate clearing mode", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        transactionServiceMock.getHandler().activateClearing.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ActivateClearingCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().activateClearing).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);

        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CLEARING_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);

        expect(transactionServiceMock.getHandler().activateClearing).toHaveBeenCalledWith(evmAddress);
      });
    });
  });
});
