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
import { ClearingRedeemByPartitionCommandFixture } from "@test/fixtures/clearing/ClearingFixture";
import SecurityService from "@service/security/SecurityService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { faker } from "@faker-js/faker/.";
import { ProtectedClearingRedeemByPartitionCommandHandler } from "./ProtectedClearingRedeemByPartitionCommandHandler";
import {
  ProtectedClearingRedeemByPartitionCommand,
  ProtectedClearingRedeemByPartitionCommandResponse,
} from "./ProtectedClearingRedeemByPartitionCommand";
import Account from "@domain/context/account/Account";
import { ProtectedClearingRedeemByPartitionCommandError } from "./error/ProtectedClearingRedeemByPartitionCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("ProtectedClearingRedeemByPartitionCommandHandler", () => {
  let handler: ProtectedClearingRedeemByPartitionCommandHandler;
  let command: ProtectedClearingRedeemByPartitionCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const security = new Security(SecurityPropsFixture.create());
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  const clearingId = faker.string.hexadecimal({
    length: 64,
    prefix: "0x",
  });

  beforeEach(() => {
    handler = new ProtectedClearingRedeemByPartitionCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = ClearingRedeemByPartitionCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ProtectedClearingRedeemByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ProtectedClearingRedeemByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(
            `An error occurred while executing protected clearing redeem operation: ${errorMsg}`,
          ),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully create clearing create protected clearing redeem", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        securityServiceMock.get.mockResolvedValue(security);
        transactionServiceMock.getHandler().protectedClearingRedeemByPartition.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(clearingId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ProtectedClearingRedeemByPartitionCommandResponse);
        expect(result.payload).toBe(parseInt(clearingId));
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);
        expect(validationServiceMock.checkProtectedPartitions).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkProtectedPartitions).toHaveBeenCalledWith(security);
        expect(validationServiceMock.checkProtectedPartitionRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkProtectedPartitionRole).toHaveBeenCalledWith(
          command.partitionId,
          account.id.toString(),
          command.securityId,
        );
        expect(validationServiceMock.checkValidNounce).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkValidNounce).toHaveBeenCalledWith(
          command.securityId,
          command.sourceId,
          command.nonce,
        );
        expect(validationServiceMock.checkBalance).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledWith(
          command.securityId,
          command.sourceId,
          BigDecimal.fromString(command.amount, security.decimals),
        );
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledWith(command.securityId);

        expect(transactionServiceMock.getHandler().protectedClearingRedeemByPartition).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().protectedClearingRedeemByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          BigDecimal.fromString(command.amount, security.decimals),
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
          className: ProtectedClearingRedeemByPartitionCommandHandler.name,
          position: 1,
          numberOfResultsItems: 2,
        });
      });
    });
  });
});
