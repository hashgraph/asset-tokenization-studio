// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { SetDividendCommandHandler } from "./SetDividendCommandHandler";
import { SetDividendCommand, SetDividendCommandResponse } from "./SetDividendCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { faker } from "@faker-js/faker/.";
import { SetDividendCommandError } from "./error/SetDividendCommandError";
import { ErrorCode } from "@core/error/BaseError";
import { SetDividendCommandFixture } from "@test/fixtures/equity/EquityFixture";

describe("SetDividendCommandHandler", () => {
  let handler: SetDividendCommandHandler;
  let command: SetDividendCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const dividendId = faker.string.hexadecimal({ length: 64, prefix: "0x" });
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetDividendCommandHandler(transactionServiceMock, contractServiceMock);
    command = SetDividendCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetDividendCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetDividendCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while setting the dividends: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully set dividend", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().setDividend.mockResolvedValue({
          id: transactionId,
          response: dividendId,
        });

        transactionServiceMock.getTransactionResult.mockResolvedValue(dividendId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(SetDividendCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.address);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
          expect.objectContaining({
            res: { id: transactionId, response: dividendId },
            className: SetDividendCommandHandler.name,
            position: 0,
            numberOfResultsItems: 1,
          }),
        );
        expect(transactionServiceMock.getHandler().setDividend).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().setDividend).toHaveBeenCalledWith(
          evmAddress,
          BigDecimal.fromString(command.recordDate),
          BigDecimal.fromString(command.executionDate),
          BigDecimal.fromString(command.amount),
          command.address,
        );
        expect(result.payload).toBe(parseInt(dividendId, 16));
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
