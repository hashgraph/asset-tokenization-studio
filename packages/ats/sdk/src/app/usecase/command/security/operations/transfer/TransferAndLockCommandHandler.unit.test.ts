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
import { ErrorCode } from "@core/error/BaseError";
import { TransferAndLockCommandFixture } from "@test/fixtures/transfer/TransferFixture";
import Account from "@domain/context/account/Account";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { TransferAndLockCommandError } from "./error/TransferAndLockCommandError";
import { TransferAndLockCommandHandler } from "./TransferAndLockCommandHandler";
import { TransferAndLockCommand, TransferAndLockCommandResponse } from "./TransferAndLockCommand";
import { faker } from "@faker-js/faker/.";
import SecurityService from "@service/security/SecurityService";

describe("TransferAndLockCommandHandler", () => {
  let handler: TransferAndLockCommandHandler;
  let command: TransferAndLockCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());
  const security = new Security(SecurityPropsFixture.create());
  const lockId = faker.string.hexadecimal({
    length: 64,
    prefix: "0x",
  });

  beforeEach(() => {
    handler = new TransferAndLockCommandHandler(
      securityServiceMock,
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    const commandRaw = TransferAndLockCommandFixture.create();
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { ...commandFiltered } = commandRaw;
    command = commandFiltered;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws TransferAndLockCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(TransferAndLockCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while transferring and locking tokens: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully transfer and lock", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().transferAndLock.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(lockId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(TransferAndLockCommandResponse);
        expect(result.payload).toBe(parseInt(lockId, 16));
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.targetId);

        expect(validationServiceMock.checkCanTransfer).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkCanTransfer).toHaveBeenCalledWith(
          command.securityId,
          command.targetId,
          command.amount,
          account.id.toString(),
        );

        expect(transactionServiceMock.getHandler().transferAndLock).toHaveBeenCalledTimes(1);

        expect(transactionServiceMock.getHandler().transferAndLock).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          BigDecimal.fromString(command.expirationDate.substring(0, 10)),
          command.securityId,
        );
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith({
          res: { id: transactionId },
          className: TransferAndLockCommandHandler.name,
          position: 1,
          numberOfResultsItems: 2,
        });
      });
    });
  });
});
