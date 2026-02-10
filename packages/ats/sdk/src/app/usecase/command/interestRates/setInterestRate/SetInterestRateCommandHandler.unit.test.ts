// SPDX-License-Identifier: Apache-2.0

import TransactionService from "@service/transaction/TransactionService";
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { ErrorCode } from "@core/error/BaseError";
import TransactionAdapter from "@port/out/TransactionAdapter";
import { SetInterestRateCommandHandler } from "./SetInterestRateCommandHandler";
import { SetInterestRateCommand, SetInterestRateCommandResponse } from "./SetInterestRateCommand";
import { SetInterestRateCommandError } from "./error/SetInterestRateCommandError";
import AccountService from "@service/account/AccountService";

describe("SetInterestRateCommandHandler", () => {
  let handler: SetInterestRateCommandHandler;
  let command: SetInterestRateCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const handlerMock = createMock<any>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetInterestRateCommandHandler(
      transactionServiceMock,
      contractServiceMock,
      validationServiceMock,
      accountServiceMock,
    );
    command = new SetInterestRateCommand(
      "0x1234567890123456789012345678901234567890",
      "10.5",
      "5.5",
      "1.5",
      "1640995200",
      "4.5",
      "2.5",
      "30",
      8,
    );

    transactionServiceMock.getHandler.mockReturnValue(handlerMock);
    contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
    validationServiceMock.checkPause.mockResolvedValue(undefined);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetInterestRateCommandError when checkPause fails", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetInterestRateCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting interest rate: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      });

      it("throws SetInterestRateCommandError when getContractEvmAddress fails", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetInterestRateCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting interest rate: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
      });

      it("throws SetInterestRateCommandError when setInterestRate fails", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        handlerMock.setInterestRate.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetInterestRateCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting interest rate: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(handlerMock.setInterestRate).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.maxRate, command.rateDecimals),
          BigDecimal.fromString(command.baseRate, command.rateDecimals),
          BigDecimal.fromString(command.minRate, command.rateDecimals),
          BigDecimal.fromString(command.startPeriod),
          BigDecimal.fromString(command.startRate, command.rateDecimals),
          BigDecimal.fromString(command.missedPenalty, command.rateDecimals),
          BigDecimal.fromString(command.reportPeriod),
          command.rateDecimals,
          command.securityId,
        );
      });

      it("throws SetInterestRateCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        validationServiceMock.checkRole.mockResolvedValue(undefined);
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        // Mock the transaction handler to throw an error
        const mockHandler = createMock<TransactionAdapter>();
        mockHandler.setInterestRate.mockRejectedValue(fakeError);
        transactionServiceMock.getHandler.mockReturnValue(mockHandler);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetInterestRateCommandError);
        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting interest rate: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });

    describe("success cases", () => {
      it("should successfully set interest rate", async () => {
        const transactionResponse = {
          id: transactionId,
          error: undefined,
        };
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        handlerMock.setInterestRate.mockResolvedValue(transactionResponse);

        const result = await handler.execute(command);

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(handlerMock.setInterestRate).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.maxRate, command.rateDecimals),
          BigDecimal.fromString(command.baseRate, command.rateDecimals),
          BigDecimal.fromString(command.minRate, command.rateDecimals),
          BigDecimal.fromString(command.startPeriod),
          BigDecimal.fromString(command.startRate, command.rateDecimals),
          BigDecimal.fromString(command.missedPenalty, command.rateDecimals),
          BigDecimal.fromString(command.reportPeriod),
          command.rateDecimals,
          command.securityId,
        );

        expect(result).toEqual(
          new SetInterestRateCommandResponse(transactionResponse.error === undefined, transactionResponse.id!),
        );
      });

      it("should successfully set interest rate with error in response", async () => {
        const transactionResponse = {
          id: transactionId,
          error: "Some error",
        };
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        handlerMock.setInterestRate.mockResolvedValue(transactionResponse);

        const result = await handler.execute(command);

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(handlerMock.setInterestRate).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.maxRate, command.rateDecimals),
          BigDecimal.fromString(command.baseRate, command.rateDecimals),
          BigDecimal.fromString(command.minRate, command.rateDecimals),
          BigDecimal.fromString(command.startPeriod),
          BigDecimal.fromString(command.startRate, command.rateDecimals),
          BigDecimal.fromString(command.missedPenalty, command.rateDecimals),
          BigDecimal.fromString(command.reportPeriod),
          command.rateDecimals,
          command.securityId,
        );

        expect(result).toEqual(
          new SetInterestRateCommandResponse(transactionResponse.error === undefined, transactionResponse.id!),
        );
        expect(result.payload).toBe(false);
      });
    });
  });
});
