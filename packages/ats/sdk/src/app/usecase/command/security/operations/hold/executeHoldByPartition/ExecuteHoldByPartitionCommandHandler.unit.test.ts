// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import { ErrorCode } from "@core/error/BaseError";
import SecurityService from "@service/security/SecurityService";
import { HandleHoldCommandFixture } from "@test/fixtures/hold/HoldFixture";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { ExecuteHoldByPartitionCommandHandler } from "./ExecuteHoldByPartitionCommandHandler";
import { ExecuteHoldByPartitionCommand, ExecuteHoldByPartitionCommandResponse } from "./ExecuteHoldByPartitionCommand";
import { ExecuteHoldByPartitionCommandError } from "./error/ExecuteHoldByPartitionCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

describe("ExecuteHoldByPartitionCommandHandler", () => {
  let handler: ExecuteHoldByPartitionCommandHandler;
  let command: ExecuteHoldByPartitionCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new ExecuteHoldByPartitionCommandHandler(
      securityServiceMock,
      transactionServiceMock,
      accountServiceMock,
      contractServiceMock,
      validationServiceMock,
    );
    command = HandleHoldCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ExecuteHoldByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ExecuteHoldByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while executing hold: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully execute hold", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddressOrNull.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);
        transactionServiceMock.getHandler().executeHoldByPartition.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ExecuteHoldByPartitionCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);
        expect(transactionServiceMock.getHandler().executeHoldByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkHoldBalance).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkHoldBalance).toHaveBeenCalledWith(
          command.securityId,
          command.partitionId,
          command.sourceId,
          command.holdId,
          BigDecimal.fromString(command.amount, security.decimals),
        );
        expect(validationServiceMock.checkKycAddresses).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkKycAddresses).toHaveBeenCalledWith(
          command.securityId,
          [command.sourceId, command.targetId],
          KycStatus.GRANTED,
        );
        expect(transactionServiceMock.getHandler().executeHoldByPartition).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          command.partitionId,
          command.holdId,
          command.securityId,
        );
      });
    });
  });
});
