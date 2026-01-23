// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { ErrorCode } from "@core/error/BaseError";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/shared/DataFixture";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { PauseCommandFixture } from "@test/fixtures/pause/PauseFixture";
import { UnpauseCommandHandler } from "./UnpauseCommandHandler";
import { UnpauseCommand, UnpauseCommandResponse } from "./UnpauseCommand";
import { UnpauseCommandError } from "./error/UnpauseCommandError";

describe("UnpauseCommandHandler", () => {
  let handler: UnpauseCommandHandler;
  let command: UnpauseCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new UnpauseCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = PauseCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws UnpauseCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(UnpauseCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while unpausing security: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully unpause security", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);

        transactionServiceMock.getHandler().unpause.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(UnpauseCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(transactionServiceMock.getHandler().unpause).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkUnpause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkUnpause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._PAUSER_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(transactionServiceMock.getHandler().unpause).toHaveBeenCalledWith(evmAddress, command.securityId);
      });
    });
  });
});
