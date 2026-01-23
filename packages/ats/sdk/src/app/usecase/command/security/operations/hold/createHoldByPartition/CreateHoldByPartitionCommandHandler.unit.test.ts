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
import { CreateHoldByPartitionCommandHandler } from "./CreateHoldByPartitionCommandHandler";
import { CreateHoldByPartitionCommand, CreateHoldByPartitionCommandResponse } from "./CreateHoldByPartitionCommand";
import { CreateHoldByPartitionCommandError } from "./error/CreateHoldByPartitionCommandError";

describe("CreateHoldByPartitionCommandHandler", () => {
  let handler: CreateHoldByPartitionCommandHandler;
  let command: CreateHoldByPartitionCommand;

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
    handler = new CreateHoldByPartitionCommandHandler(
      securityServiceMock,
      accountServiceMock,
      contractServiceMock,
      transactionServiceMock,
      validationServiceMock,
    );
    const commandRaw = CreateHoldCommandFixture.omit("sourceId").create();
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { deadline, nonce, signature, ...commandFiltered } = commandRaw;
    command = commandFiltered;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CreateHoldByPartitionCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CreateHoldByPartitionCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while creating hold: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully create hold", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddressOrNull.mockResolvedValue(evmAddress);
        securityServiceMock.get.mockResolvedValue(security);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        transactionServiceMock.getHandler().createHoldByPartition.mockResolvedValue({
          id: transactionId,
        });
        transactionServiceMock.getTransactionResult.mockResolvedValue(holdId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CreateHoldByPartitionCommandResponse);
        expect(result.payload).toBe(parseInt(holdId, 16));
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.escrowId);
        expect(accountServiceMock.getAccountEvmAddressOrNull).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddressOrNull).toHaveBeenCalledWith(command.targetId);

        expect(transactionServiceMock.getHandler().createHoldByPartition).toHaveBeenCalledTimes(1);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkDecimals).toHaveBeenCalledWith(security, command.amount);
        expect(validationServiceMock.checkClearingDeactivated).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkClearingDeactivated).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkBalance).toHaveBeenCalledWith(
          command.securityId,
          account.id.toString(),
          BigDecimal.fromString(command.amount, security.decimals),
        );
        expect(transactionServiceMock.getHandler().createHoldByPartition).toHaveBeenCalledWith(
          evmAddress,
          command.partitionId,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          evmAddress,
          BigDecimal.fromString(command.expirationDate.substring(0, 10)),
          command.securityId,
        );

        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith({
          res: { id: transactionId },
          className: CreateHoldByPartitionCommandHandler.name,
          position: 1,
          numberOfResultsItems: 2,
        });
      });
    });
  });
});
