// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { ErrorCode } from "@core/error/BaseError";
import SecurityService from "@service/security/SecurityService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/shared/DataFixture";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { LockCommandError } from "./error/LockCommandError";
import { LockCommandHandler } from "./LockCommandHandler";
import { LockCommand, LockCommandResponse } from "./LockCommand";
import { LockCommandFixture } from "@test/fixtures/lock/LockFixture";

describe("IssueCommandHandler", () => {
  let handler: LockCommandHandler;
  let command: LockCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const security = new Security(SecurityPropsFixture.create());
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new LockCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = LockCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws LockCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(LockCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while locking tokens: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully lock tokens", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().lock.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(LockCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);
        expect(transactionServiceMock.getHandler().lock).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._LOCKER_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(transactionServiceMock.getHandler().lock).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          BigDecimal.fromString(command.expirationDate.substring(0, 10)),
          command.securityId,
        );
      });
    });
  });
});
