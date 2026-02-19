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
import { SetRateCommandHandler } from "./SetRateCommandHandler";
import { SetRateCommand, SetRateCommandResponse } from "./SetRateCommand";
import { SetRateCommandError } from "./error/SetRateCommandError";
import AccountService from "@service/account/AccountService";

describe("SetRateCommandHandler", () => {
  let handler: SetRateCommandHandler;
  let command: SetRateCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const handlerMock = createMock<any>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetRateCommandHandler(
      transactionServiceMock,
      contractServiceMock,
      validationServiceMock,
      accountServiceMock,
    );
    command = new SetRateCommand("0x1234567890123456789012345678901234567890", "5.5", 8);

    transactionServiceMock.getHandler.mockReturnValue(handlerMock);
    contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
    validationServiceMock.checkPause.mockResolvedValue(undefined);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetRateCommandError when checkPause fails", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetRateCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting rate: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      });

      it("throws SetRateCommandError when getContractEvmAddress fails", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetRateCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting rate: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
      });

      it("throws SetRateCommandError when setRate fails", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        handlerMock.setRate.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetRateCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting rate: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(handlerMock.setRate).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.rate, command.rateDecimals),
          command.rateDecimals,
          command.securityId,
        );
      });

      it("throws SetRateCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        validationServiceMock.checkRole.mockResolvedValue(undefined);
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        // Mock the transaction handler to throw an error
        const mockHandler = createMock<TransactionAdapter>();
        mockHandler.setRate.mockRejectedValue(fakeError);
        transactionServiceMock.getHandler.mockReturnValue(mockHandler);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetRateCommandError);
        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting rate: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });

    describe("success cases", () => {
      it("should successfully set rate", async () => {
        const transactionResponse = {
          id: transactionId,
          error: undefined,
        };
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        handlerMock.setRate.mockResolvedValue(transactionResponse);

        const result = await handler.execute(command);

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(handlerMock.setRate).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.rate, command.rateDecimals),
          command.rateDecimals,
          command.securityId,
        );

        expect(result).toEqual(
          new SetRateCommandResponse(transactionResponse.error === undefined, transactionResponse.id!),
        );
      });

      it("should successfully set rate with error in response", async () => {
        const transactionResponse = {
          id: transactionId,
          error: "Some error",
        };
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        handlerMock.setRate.mockResolvedValue(transactionResponse);

        const result = await handler.execute(command);

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(handlerMock.setRate).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.rate, command.rateDecimals),
          command.rateDecimals,
          command.securityId,
        );

        expect(result).toEqual(
          new SetRateCommandResponse(transactionResponse.error === undefined, transactionResponse.id!),
        );
        expect(result.payload).toBe(false);
      });
    });
  });
});
