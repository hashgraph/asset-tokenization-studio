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
import { UnprotectPartitionsCommandError } from "./error/UnprotectPartitionsCommandError";
import { ProtectPartitionsCommandFixture } from "@test/fixtures/protectedPartitions/ProtectedPartitionsFixture";
import { UnprotectPartitionsCommandHandler } from "./UnprotectPartitionsCommandHandler";
import { UnprotectPartitionsCommand, UnprotectPartitionsCommandResponse } from "./UnprotectPartitionsCommand";

describe("UnprotectPartitionsCommandHandler", () => {
  let handler: UnprotectPartitionsCommandHandler;
  let command: UnprotectPartitionsCommand;

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
    handler = new UnprotectPartitionsCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = ProtectPartitionsCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws UnprotectPartitionsCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(UnprotectPartitionsCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while unprotecting partitions: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully unprotect partitions", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().unprotectPartitions.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(UnprotectPartitionsCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(transactionServiceMock.getHandler().unprotectPartitions).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._PROTECTED_PARTITION_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(validationServiceMock.checkProtectedPartitions).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkProtectedPartitions).toHaveBeenCalledWith(security);

        expect(transactionServiceMock.getHandler().unprotectPartitions).toHaveBeenCalledWith(
          evmAddress,
          command.securityId,
        );
      });
    });
  });
});
