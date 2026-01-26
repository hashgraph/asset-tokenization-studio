// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { SetDividendsCommandHandler } from "./SetDividendsCommandHandler";
import { SetDividendsCommand, SetDividendsCommandResponse } from "./SetDividendsCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { faker } from "@faker-js/faker/.";
import { SetDividendsCommandFixture } from "@test/fixtures/equity/EquityFixture";
import { SetDividendsCommandError } from "./error/SetDividendsCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("SetDividendsCommandHandler", () => {
  let handler: SetDividendsCommandHandler;
  let command: SetDividendsCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const dividendId = faker.string.hexadecimal({ length: 64, prefix: "0x" });
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetDividendsCommandHandler(transactionServiceMock, contractServiceMock);
    command = SetDividendsCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetDividendsCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetDividendsCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while setting the dividends: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully set dividends", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().setDividends.mockResolvedValue({
          id: transactionId,
          response: dividendId,
        });

        transactionServiceMock.getTransactionResult.mockResolvedValue(dividendId);

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(SetDividendsCommandResponse);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.address);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
          expect.objectContaining({
            res: { id: transactionId, response: dividendId },
            className: SetDividendsCommandHandler.name,
            position: 0,
            numberOfResultsItems: 1,
          }),
        );
        expect(transactionServiceMock.getHandler().setDividends).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().setDividends).toHaveBeenCalledWith(
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
