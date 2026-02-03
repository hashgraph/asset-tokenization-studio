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
import { ClearingCreateHoldByPartitionCommandFixture } from "@test/fixtures/clearing/ClearingFixture";
import SecurityService from "@service/security/SecurityService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { ClearingCreateHoldByPartitionCommandHandler } from "./ClearingCreateHoldByPartitionCommandHandler";
import {
  ClearingCreateHoldByPartitionCommand,
  ClearingCreateHoldByPartitionCommandResponse,
} from "./ClearingCreateHoldByPartitionCommand";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { faker } from "@faker-js/faker/.";
import { ClearingCreateHoldByPartitionCommandError } from "./error/ClearingCreateHoldByPartitionCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("ClearingCreateHoldByPartitionCommandHandler", () => {
  let handler: ClearingCreateHoldByPartitionCommandHandler;
  let command: ClearingCreateHoldByPartitionCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();
  const errorMsg = ErrorMsgFixture.create().msg;

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());
  const security = new Security(SecurityPropsFixture.create());

  const clearingId = faker.string.hexadecimal({
    length: 64,
    prefix: "0x",
  });

  beforeEach(() => {
    handler = new ClearingCreateHoldByPartitionCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    const commandRaw = ClearingCreateHoldByPartitionCommandFixture.omit("sourceId").create();
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { deadline, nonce, signature, ...commandFiltered } = commandRaw;
    command = commandFiltered;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ClearingCreateHoldByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ClearingCreateHoldByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(
            `An error occurred while executing clearing create hold operation: ${errorMsg}`,
          ),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully create clearing hold", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddressOrNull.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);
        transactionServiceMock.getHandler().clearingCreateHoldByPartition.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(clearingId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ClearingCreateHoldByPartitionCommandResponse);
        expect(result.payload).toBe(parseInt(clearingId));
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().clearingCreateHoldByPartition).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledWith(
          command.securityId,
          account.id.toString(),
          BigDecimal.fromString(command.amount, security.decimals),
        );
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
        expect(transactionServiceMock.getHandler().clearingCreateHoldByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          evmAddress,
          BigDecimal.fromString(command.clearingExpirationDate.substring(0, 10)),
          BigDecimal.fromString(command.holdExpirationDate.substring(0, 10)),
          command.securityId,
        );
      });
    });
  });
});
