// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { SetAmortizationCommandHandler } from "./SetAmortizationCommandHandler";
import { SetAmortizationCommand, SetAmortizationCommandResponse } from "./SetAmortizationCommand";
import TransactionService from "@service/transaction/TransactionService";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { faker } from "@faker-js/faker/.";
import { SetAmortizationCommandError } from "./error/SetAmortizationCommandError";
import { ErrorCode } from "@core/error/BaseError";
import { SetAmortizationCommandFixture } from "@test/fixtures/amortization/AmortizationFixture";

describe("SetAmortizationCommandHandler", () => {
  let handler: SetAmortizationCommandHandler;
  let command: SetAmortizationCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const accountServiceMock = createMock<AccountService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const accountEvmAddress = EvmAddressPropsFixture.create().value;

  const amortizationId = faker.string.hexadecimal({ length: 64, prefix: "0x" });
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetAmortizationCommandHandler(
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = SetAmortizationCommandFixture.create();

    accountServiceMock.getCurrentAccount.mockReturnValue({ evmAddress: accountEvmAddress } as any);
    validationServiceMock.checkPause.mockResolvedValue(undefined);
    validationServiceMock.checkRole.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetAmortizationCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetAmortizationCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while setting the amortization: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });

    describe("success cases", () => {
      it("should successfully set amortization", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().setAmortization.mockResolvedValue({
          id: transactionId,
          response: amortizationId,
        });

        transactionServiceMock.getTransactionResult.mockResolvedValue(amortizationId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(SetAmortizationCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CORPORATEACTIONS_ROLE,
          accountEvmAddress,
          command.securityId,
        );
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
          expect.objectContaining({
            res: { id: transactionId, response: amortizationId },
            className: SetAmortizationCommandHandler.name,
            position: 0,
            numberOfResultsItems: 1,
          }),
        );
        expect(transactionServiceMock.getHandler().setAmortization).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().setAmortization).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.recordDate),
          BigDecimal.fromString(command.executionDate),
          BigDecimal.fromString(command.tokensToRedeem),
          command.securityId,
        );
        expect(result.payload).toBe(parseInt(amortizationId, 16));
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
