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
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { HandleClearingOperationByPartitionCommandFixture } from "@test/fixtures/clearing/ClearingFixture";
import { ApproveClearingOperationByPartitionCommandHandler } from "./ApproveClearingOperationByPartitionCommandHandler";
import {
  ApproveClearingOperationByPartitionCommand,
  ApproveClearingOperationByPartitionCommandResponse,
} from "./ApproveClearingOperationByPartitionCommand";
import SecurityService from "@service/security/SecurityService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { ApproveClearingOperationByPartitionCommandError } from "./error/ApproveClearingOperationByPartitionCommandError";
import { ErrorCode } from "@core/error/BaseError";
import { KycStatus } from "@domain/context/kyc/Kyc";

describe("ApproveClearingOperationByPartitionCommandHandler", () => {
  let handler: ApproveClearingOperationByPartitionCommandHandler;
  let command: ApproveClearingOperationByPartitionCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());
  const security = new Security(SecurityPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new ApproveClearingOperationByPartitionCommandHandler(
      accountServiceMock,
      transactionServiceMock,
      securityServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = HandleClearingOperationByPartitionCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ApproveClearingOperationByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ApproveClearingOperationByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while approving clearing operation: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully approve clearing", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);
        transactionServiceMock.getHandler().approveClearingOperationByPartition.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ApproveClearingOperationByPartitionCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getCurrentAccount).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().approveClearingOperationByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkClearingActivated).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkKycAddresses).toHaveBeenCalledWith(
          command.securityId,
          [command.targetId],
          KycStatus.GRANTED,
        );
        expect(validationServiceMock.checkKycAddresses).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CLEARING_VALIDATOR_ROLE,
          account.id.toString(),
          command.securityId,
        );
        expect(validationServiceMock.checkControlList).toHaveBeenCalledWith(command.securityId, evmAddress.toString());
        expect(validationServiceMock.checkMultiPartition).toHaveBeenCalledWith(security, command.partitionId);
        expect(validationServiceMock.checkMultiPartition).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, command.securityId);

        expect(transactionServiceMock.getHandler().approveClearingOperationByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          evmAddress,
          command.clearingId,
          command.clearingOperationType,
          command.securityId,
        );
      });
    });
  });
});
