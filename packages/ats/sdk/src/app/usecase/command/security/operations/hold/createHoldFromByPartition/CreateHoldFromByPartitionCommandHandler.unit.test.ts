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
import { CreateHoldCommandFixture } from "@test/fixtures/hold/HoldFixture";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { faker } from "@faker-js/faker/.";
import { CreateHoldFromByPartitionCommandHandler } from "./CreateHoldFromByPartitionCommandHandler";
import {
  CreateHoldFromByPartitionCommand,
  CreateHoldFromByPartitionCommandResponse,
} from "./CreateHoldFromByPartitionCommand";
import { CreateHoldFromByPartitionCommandError } from "./error/CreateHoldFromByPartitionCommandError";

describe("CreateHoldFromByPartitionCommandHandler", () => {
  let handler: CreateHoldFromByPartitionCommandHandler;
  let command: CreateHoldFromByPartitionCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;
  const security = new Security(SecurityPropsFixture.create());

  const holdId = faker.string.hexadecimal({
    length: 64,
    prefix: "0x",
  });

  beforeEach(() => {
    handler = new CreateHoldFromByPartitionCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    const commandRaw = CreateHoldCommandFixture.create();
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { deadline, nonce, signature, ...commandFiltered } = commandRaw;
    command = commandFiltered;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CreateHoldFromByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CreateHoldFromByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating hold from: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully create hold from source", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddressOrNull.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);
        transactionServiceMock.getHandler().createHoldFromByPartition.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(holdId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateHoldFromByPartitionCommandResponse);
        expect(result.payload).toBe(parseInt(holdId, 16));
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.escrowId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(2, command.sourceId);
        expect(accountServiceMock.getAccountEvmAddressOrNull).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddressOrNull).toHaveBeenCalledWith(command.targetId);

        expect(transactionServiceMock.getHandler().createHoldFromByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkClearingDeactivated).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkClearingDeactivated).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledWith(
          command.securityId,
          command.sourceId,
          BigDecimal.fromString(command.amount, security.decimals),
        );
        expect(transactionServiceMock.getHandler().createHoldFromByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          evmAddress,
          evmAddress,
          BigDecimal.fromString(command.expirationDate.substring(0, 10)),
          command.securityId,
        );

        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith({
          res: { id: transactionId },
          className: CreateHoldFromByPartitionCommandHandler.name,
          position: 1,
          numberOfResultsItems: 2,
        });
      });
    });
  });
});
