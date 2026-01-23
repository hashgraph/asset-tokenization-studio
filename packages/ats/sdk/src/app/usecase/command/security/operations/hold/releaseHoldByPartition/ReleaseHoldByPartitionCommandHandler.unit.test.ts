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
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { ReleaseHoldByPartitionCommandHandler } from "./ReleaseHoldByPartitionCommandHandler";
import { ReleaseHoldByPartitionCommand, ReleaseHoldByPartitionCommandResponse } from "./ReleaseHoldByPartitionCommand";
import { ReleaseHoldByPartitionCommandError } from "./error/ReleaseHoldByPartitionCommandError";
import BigDecimal from "@domain/context/shared/BigDecimal";

describe("ReleaseHoldByPartitionCommandHandler", () => {
  let handler: ReleaseHoldByPartitionCommandHandler;
  let command: ReleaseHoldByPartitionCommand;

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
    handler = new ReleaseHoldByPartitionCommandHandler(
      securityServiceMock,
      transactionServiceMock,
      validationServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    command = HandleHoldCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ReleaseHoldByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ReleaseHoldByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while releasing hold: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully release hold", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().releaseHoldByPartition.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ReleaseHoldByPartitionCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.targetId);
        expect(transactionServiceMock.getHandler().releaseHoldByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkHoldBalance).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkHoldBalance).toHaveBeenCalledWith(
          command.securityId,
          command.partitionId,
          command.targetId,
          command.holdId,
          BigDecimal.fromString(command.amount, security.decimals),
        );

        expect(transactionServiceMock.getHandler().releaseHoldByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          command.holdId,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          command.securityId,
        );
      });
    });
  });
});
