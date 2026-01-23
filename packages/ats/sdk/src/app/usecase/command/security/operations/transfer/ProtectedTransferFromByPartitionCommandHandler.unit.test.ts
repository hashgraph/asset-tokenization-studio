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
import { TransferCommandFixture } from "@test/fixtures/transfer/TransferFixture";
import Account from "@domain/context/account/Account";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { KycStatus } from "@domain/context/kyc/Kyc";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { ProtectedTransferFromByPartitionCommandHandler } from "./ProtectedTransferFromByPartitionCommandHandler";
import {
  ProtectedTransferFromByPartitionCommand,
  ProtectedTransferFromByPartitionCommandResponse,
} from "./ProtectedTransferFromByPartitionCommand";
import { ProtectedTransferFromByPartitionCommandError } from "./error/ProtectedTransferFromByPartitionCommandError";
import SecurityService from "@service/security/SecurityService";

describe("ProtectedTransferFromByPartitionCommandHandler", () => {
  let handler: ProtectedTransferFromByPartitionCommandHandler;
  let command: ProtectedTransferFromByPartitionCommand;

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

  beforeEach(() => {
    handler = new ProtectedTransferFromByPartitionCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = TransferCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ProtectedTransferFromByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ProtectedTransferFromByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while protected transferring from tokens: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully protected protected transfer from", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().protectedTransferFromByPartition.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ProtectedTransferFromByPartitionCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(2, command.targetId);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkProtectedPartitions).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkProtectedPartitions).toHaveBeenCalledWith(security);
        expect(validationServiceMock.checkProtectedPartitionRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkProtectedPartitionRole).toHaveBeenCalledWith(
          command.partitionId,
          account.id.toString(),
          command.securityId,
        );
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkKycAddresses).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkKycAddresses).toHaveBeenCalledWith(
          command.securityId,
          [command.sourceId, command.targetId],
          KycStatus.GRANTED,
        );
        expect(validationServiceMock.checkControlList).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkControlList).toHaveBeenCalledWith(
          command.securityId,
          evmAddress.toString(),
          evmAddress.toString(),
        );

        expect(validationServiceMock.checkBalance).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledWith(
          command.securityId,
          command.sourceId,
          BigDecimal.fromString(command.amount, security.decimals),
        );

        expect(validationServiceMock.checkValidNounce).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkValidNounce).toHaveBeenCalledWith(
          command.securityId,
          command.sourceId,
          command.nounce,
        );

        expect(transactionServiceMock.getHandler().protectedTransferFromByPartition).toHaveBeenCalledTimes(1);

        expect(transactionServiceMock.getHandler().protectedTransferFromByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          evmAddress,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          BigDecimal.fromString(command.deadline.substring(0, 10)),
          BigDecimal.fromString(command.nounce.toString()),
          command.signature,
        );
      });
    });
  });
});
