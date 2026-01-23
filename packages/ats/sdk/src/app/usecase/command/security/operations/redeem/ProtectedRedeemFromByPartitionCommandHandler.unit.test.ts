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
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { RedeemCommandFixture } from "@test/fixtures/redeem/RedeemFixture";
import { ProtectedRedeemFromByPartitionCommandHandler } from "./ProtectedRedeemFromByPartitionCommandHandler";
import {
  ProtectedRedeemFromByPartitionCommand,
  ProtectedRedeemFromByPartitionCommandResponse,
} from "./ProtectedRedeemFromByPartitionCommand";
import { ProtectedRedeemFromByPartitionCommandError } from "./error/ProtectedRedeemFromByPartitionCommandError";

describe("ProtectedRedeemFromByPartitionCommandHandler", () => {
  let handler: ProtectedRedeemFromByPartitionCommandHandler;
  let command: ProtectedRedeemFromByPartitionCommand;

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
    handler = new ProtectedRedeemFromByPartitionCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = RedeemCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ProtectedRedeemFromByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ProtectedRedeemFromByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while protected redeeming from tokens: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully protected redeem tokens", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().protectedRedeemFromByPartition.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ProtectedRedeemFromByPartitionCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);

        expect(transactionServiceMock.getHandler().protectedRedeemFromByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkCanRedeem).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkCanRedeem).toHaveBeenCalledWith(
          command.securityId,
          command.sourceId,
          command.amount,
          command.partitionId,
        );

        expect(transactionServiceMock.getHandler().protectedRedeemFromByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          BigDecimal.fromString(command.deadline.substring(0, 10)),
          BigDecimal.fromString(command.nounce.toString()),
          command.signature,
          command.securityId,
        );
      });
    });
  });
});
