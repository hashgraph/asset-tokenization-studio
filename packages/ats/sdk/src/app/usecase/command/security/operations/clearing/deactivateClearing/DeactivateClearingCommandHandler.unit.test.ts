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
import { SwitchClearingModeCommandFixture } from "@test/fixtures/clearing/ClearingFixture";
import { DeactivateClearingCommandHandler } from "./DeactivateClearingCommandHandler";
import { DeactivateClearingCommand, DeactivateClearingCommandResponse } from "./DeactivateClearingCommand";
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { DeactivateClearingCommandError } from "./error/DeactivateClearingCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("DeactivateClearingCommandHandler", () => {
  let handler: DeactivateClearingCommandHandler;
  let command: DeactivateClearingCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new DeactivateClearingCommandHandler(
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = SwitchClearingModeCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws DeactivateClearingCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(DeactivateClearingCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while deactivating clearing mode: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully deactivate clearing", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        transactionServiceMock.getHandler().deactivateClearing.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(DeactivateClearingCommandResponse);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);

        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CLEARING_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);

        expect(transactionServiceMock.getHandler().deactivateClearing).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().deactivateClearing).toHaveBeenCalledWith(evmAddress);
      });
    });
  });
});
