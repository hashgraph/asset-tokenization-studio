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
import SecurityService from "@service/security/SecurityService";
import { CreateHoldCommandFixture } from "@test/fixtures/hold/HoldFixture";
import Account from "@domain/context/account/Account";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { faker } from "@faker-js/faker/.";
import { ProtectedCreateHoldByPartitionCommandHandler } from "./ProtectedCreateHoldByPartitionCommandHandler";
import {
  ProtectedCreateHoldByPartitionCommand,
  ProtectedCreateHoldByPartitionCommandResponse,
} from "./ProtectedCreateHoldByPartitionCommand";
import { ProtectedCreateHoldByPartitionCommandError } from "./error/ProtectedCreateHoldByPartitionCommandError";

describe("ProtectedCreateHoldByPartitionCommandHandler", () => {
  let handler: ProtectedCreateHoldByPartitionCommandHandler;
  let command: ProtectedCreateHoldByPartitionCommand;

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

  const holdId = faker.string.hexadecimal({
    length: 64,
    prefix: "0x",
  });

  beforeEach(() => {
    handler = new ProtectedCreateHoldByPartitionCommandHandler(
      securityServiceMock,
      accountServiceMock,
      contractServiceMock,
      transactionServiceMock,
      validationServiceMock,
    );
    command = CreateHoldCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ProtectedCreateHoldByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ProtectedCreateHoldByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating protected hold: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully create protected hold", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddressOrNull.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        transactionServiceMock.getHandler().protectedCreateHoldByPartition.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(holdId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ProtectedCreateHoldByPartitionCommandResponse);
        expect(result.payload).toBe(parseInt(holdId, 16));
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(2, command.escrowId);
        expect(accountServiceMock.getAccountEvmAddressOrNull).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddressOrNull).toHaveBeenCalledWith(command.targetId);

        expect(transactionServiceMock.getHandler().protectedCreateHoldByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkClearingDeactivated).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkClearingDeactivated).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkProtectedPartitionRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkProtectedPartitionRole).toHaveBeenCalledWith(
          command.partitionId,
          account.id.toString(),
          command.securityId,
        );
        expect(validationServiceMock.checkProtectedPartitions).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkProtectedPartitions).toHaveBeenCalledWith(security);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledWith(
          command.securityId,
          command.sourceId,
          BigDecimal.fromString(command.amount, security.decimals),
        );
        expect(transactionServiceMock.getHandler().protectedCreateHoldByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          BigDecimal.fromString(command.amount, security.decimals),
          evmAddress,
          evmAddress,
          evmAddress,
          BigDecimal.fromString(command.expirationDate.substring(0, 10)),
          BigDecimal.fromString(command.deadline.substring(0, 10)),
          BigDecimal.fromString(command.nonce.toString()),
          command.signature,
          command.securityId,
        );

        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith({
          res: { id: transactionId },
          className: ProtectedCreateHoldByPartitionCommandHandler.name,
          position: 1,
          numberOfResultsItems: 2,
        });
      });
    });
  });
});
