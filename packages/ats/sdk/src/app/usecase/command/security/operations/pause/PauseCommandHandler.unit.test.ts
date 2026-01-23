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
import { PauseCommandHandler } from "./PauseCommandHandler";
import { PauseCommand, PauseCommandResponse } from "./PauseCommand";
import { PauseCommandError } from "./error/PauseCommandError";
import { PauseCommandFixture } from "@test/fixtures/pause/PauseFixture";

describe("PauseCommandHandler", () => {
  let handler: PauseCommandHandler;
  let command: PauseCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new PauseCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = PauseCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws PauseCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(PauseCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while pausing security: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully pause security", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);

        transactionServiceMock.getHandler().pause.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(PauseCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(transactionServiceMock.getHandler().pause).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._PAUSER_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(transactionServiceMock.getHandler().pause).toHaveBeenCalledWith(evmAddress, command.securityId);
      });
    });
  });
});
