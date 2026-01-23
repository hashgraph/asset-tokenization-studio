// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";

import TransactionService from "@service/transaction/TransactionService.js";
import { RedeemAtMaturityByPartitionCommandHandler } from "./RedeemAtMaturityByPartitionCommandHandler";
import {
  RedeemAtMaturityByPartitionCommand,
  RedeemAtMaturityByPartitionCommandResponse,
} from "./RedeemAtMaturityByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import ContractService from "@service/contract/ContractService";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { RedeemAtMaturityByPartitionCommandFixture } from "@test/fixtures/bond/BondFixture";
import { RedeemAtMaturityByPartitionCommandError } from "./error/RedeemAtMaturityByPartitionCommandError";
import { ErrorCode } from "@core/error/BaseError";
import BigDecimal from "@domain/context/shared/BigDecimal";

describe("RedeemAtMaturityByPartitionCommandHandler", () => {
  let handler: RedeemAtMaturityByPartitionCommandHandler;
  let command: RedeemAtMaturityByPartitionCommand;

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
    handler = new RedeemAtMaturityByPartitionCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = RedeemAtMaturityByPartitionCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws RedeemAtMaturityByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(RedeemAtMaturityByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while redeeming at maturity by partition: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully redeem at maturity by partition", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().redeemAtMaturityByPartition.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(RedeemAtMaturityByPartitionCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);

        expect(transactionServiceMock.getHandler().redeemAtMaturityByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkCanRedeem).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkCanRedeem).toHaveBeenCalledWith(
          command.securityId,
          command.sourceId,
          command.amount,
          command.partitionId,
        );

        expect(transactionServiceMock.getHandler().redeemAtMaturityByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          command.securityId,
        );
      });
    });
  });
});
