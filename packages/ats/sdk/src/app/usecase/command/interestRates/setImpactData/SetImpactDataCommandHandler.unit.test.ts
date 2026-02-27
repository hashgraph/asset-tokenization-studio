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
import { SetImpactDataCommandHandler } from "./SetImpactDataCommandHandler";
import { SetImpactDataCommand, SetImpactDataCommandResponse } from "./SetImpactDataCommand";
import { SetImpactDataCommandError } from "./error/SetImpactDataCommandError";
import AccountService from "@service/account/AccountService";

describe("SetImpactDataCommandHandler", () => {
  let handler: SetImpactDataCommandHandler;
  let command: SetImpactDataCommand;

  const transactionServiceMock = createMock<TransactionService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const handlerMock = createMock<any>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetImpactDataCommandHandler(
      transactionServiceMock,
      contractServiceMock,
      validationServiceMock,
      accountServiceMock,
    );
    command = new SetImpactDataCommand("0x1234567890123456789012345678901234567890", "100.5", "50.0", "10.5", 8, "5.0");

    transactionServiceMock.getHandler.mockReturnValue(handlerMock);
    contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
    validationServiceMock.checkPause.mockResolvedValue(undefined);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetImpactDataCommandError when checkPause fails", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetImpactDataCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting impact data: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
      });

      it("throws SetImpactDataCommandError when getContractEvmAddress fails", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetImpactDataCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting impact data: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
      });

      it("throws SetImpactDataCommandError when setImpactData fails", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        handlerMock.setImpactData.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetImpactDataCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting impact data: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(handlerMock.setImpactData).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.maxDeviationCap, command.impactDataDecimals),
          BigDecimal.fromString(command.baseLine, command.impactDataDecimals),
          BigDecimal.fromString(command.maxDeviationFloor, command.impactDataDecimals),
          command.impactDataDecimals,
          BigDecimal.fromString(command.adjustmentPrecision, command.impactDataDecimals),
          command.securityId,
        );
      });

      it("throws SetImpactDataCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        validationServiceMock.checkRole.mockResolvedValue(undefined);
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        // Mock the transaction handler to throw an error
        const mockHandler = createMock<TransactionAdapter>();
        mockHandler.setImpactData.mockRejectedValue(fakeError);
        transactionServiceMock.getHandler.mockReturnValue(mockHandler);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetImpactDataCommandError);
        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`Error setting impact data: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });

    describe("success cases", () => {
      it("should successfully set impact data", async () => {
        const transactionResponse = {
          id: transactionId,
          error: undefined,
        };
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        handlerMock.setImpactData.mockResolvedValue(transactionResponse);

        const result = await handler.execute(command);

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(handlerMock.setImpactData).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.maxDeviationCap, command.impactDataDecimals),
          BigDecimal.fromString(command.baseLine, command.impactDataDecimals),
          BigDecimal.fromString(command.maxDeviationFloor, command.impactDataDecimals),
          command.impactDataDecimals,
          BigDecimal.fromString(command.adjustmentPrecision, command.impactDataDecimals),
          command.securityId,
        );

        expect(result).toEqual(
          new SetImpactDataCommandResponse(transactionResponse.error === undefined, transactionResponse.id!),
        );
      });

      it("should successfully set impact data with error in response", async () => {
        const transactionResponse = {
          id: transactionId,
          error: "Some error",
        };
        validationServiceMock.checkPause.mockResolvedValue(undefined);
        handlerMock.setImpactData.mockResolvedValue(transactionResponse);

        const result = await handler.execute(command);

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);
        expect(handlerMock.setImpactData).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.maxDeviationCap, command.impactDataDecimals),
          BigDecimal.fromString(command.baseLine, command.impactDataDecimals),
          BigDecimal.fromString(command.maxDeviationFloor, command.impactDataDecimals),
          command.impactDataDecimals,
          BigDecimal.fromString(command.adjustmentPrecision, command.impactDataDecimals),
          command.securityId,
        );

        expect(result).toEqual(
          new SetImpactDataCommandResponse(transactionResponse.error === undefined, transactionResponse.id!),
        );
        expect(result.payload).toBe(false);
      });
    });
  });
});
