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
import BigDecimal from "@domain/context/shared/BigDecimal";
import { ControllerTransferCommandHandler } from "./ControllerTransferCommandHandler";
import { ControllerTransferCommand, ControllerTransferCommandResponse } from "./ControllerTransferCommand";
import { ControllerTransferCommandError } from "./error/ControllerTransferCommandError";
import SecurityService from "@service/security/SecurityService";

describe("ControllerTransferCommandHandler", () => {
  let handler: ControllerTransferCommandHandler;
  let command: ControllerTransferCommand;

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
    handler = new ControllerTransferCommandHandler(
      securityServiceMock,
      accountServiceMock,
      transactionServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    const commandRaw = TransferCommandFixture.create();
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { deadline, nounce, signature, ...commandFiltered } = commandRaw;
    command = commandFiltered;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ControllerTransferCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        securityServiceMock.get.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ControllerTransferCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while controller transferring tokens: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully transfer by controller", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        securityServiceMock.get.mockResolvedValue(security);

        transactionServiceMock.getHandler().controllerTransfer.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ControllerTransferCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, command.sourceId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(2, command.targetId);

        expect(validationServiceMock.checkCanTransfer).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkCanTransfer).toHaveBeenCalledWith(
          command.securityId,
          command.targetId,
          command.amount,
          account.id.toString(),
          command.sourceId,
        );

        expect(transactionServiceMock.getHandler().controllerTransfer).toHaveBeenCalledTimes(1);

        expect(transactionServiceMock.getHandler().controllerTransfer).toHaveBeenCalledWith(
          evmAddress,
          evmAddress,
          evmAddress,
          BigDecimal.fromString(command.amount, security.decimals),
          command.securityId,
        );
      });
    });
  });
});
