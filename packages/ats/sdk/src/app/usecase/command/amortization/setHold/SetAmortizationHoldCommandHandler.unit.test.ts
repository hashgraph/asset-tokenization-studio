// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { SetAmortizationHoldCommandHandler } from "./SetAmortizationHoldCommandHandler";
import { SetAmortizationHoldCommand, SetAmortizationHoldCommandResponse } from "./SetAmortizationHoldCommand";
import TransactionService from "@service/transaction/TransactionService";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { faker } from "@faker-js/faker/.";
import { SetAmortizationHoldCommandError } from "./error/SetAmortizationHoldCommandError";
import { ErrorCode } from "@core/error/BaseError";
import { SetAmortizationHoldCommandFixture } from "@test/fixtures/amortization/AmortizationFixture";

describe("SetAmortizationHoldCommandHandler", () => {
  let handler: SetAmortizationHoldCommandHandler;
  let command: SetAmortizationHoldCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const accountServiceMock = createMock<AccountService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const accountEvmAddress = EvmAddressPropsFixture.create().value;
  const tokenHolderEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const holdId = faker.string.hexadecimal({ length: 64, prefix: "0x" });
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetAmortizationHoldCommandHandler(
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = SetAmortizationHoldCommandFixture.create();

    accountServiceMock.getCurrentAccount.mockReturnValue({ evmAddress: accountEvmAddress } as any);
    validationServiceMock.checkPause.mockResolvedValue(undefined);
    validationServiceMock.checkRole.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetAmortizationHoldCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetAmortizationHoldCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while setting the amortization hold: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });

    describe("success cases", () => {
      it("should successfully set amortization hold", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(tokenHolderEvmAddress);

        transactionServiceMock.getHandler().setAmortizationHold.mockResolvedValue({
          id: transactionId,
          response: holdId,
        });

        transactionServiceMock.getTransactionResult.mockResolvedValue(holdId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(SetAmortizationHoldCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
        expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(command.tokenHolder);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._AMORTIZATION_ROLE,
          accountEvmAddress,
          command.securityId,
        );
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
          expect.objectContaining({
            res: { id: transactionId, response: holdId },
            className: SetAmortizationHoldCommandHandler.name,
            position: 0,
            numberOfResultsItems: 1,
          }),
        );
        expect(transactionServiceMock.getHandler().setAmortizationHold).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().setAmortizationHold).toHaveBeenCalledWith(
          evmAddress,
          command.amortizationId,
          tokenHolderEvmAddress,
          BigDecimal.fromString(command.tokenAmount),
          command.securityId,
        );
        expect(result.payload).toBe(parseInt(holdId, 16));
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
