// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CancelDividendCommandHandler } from "./CancelDividendCommandHandler";
import { CancelDividendCommand, CancelDividendCommandResponse } from "./CancelDividendCommand";
import TransactionService from "@service/transaction/TransactionService";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import { CancelDividendCommandFixture } from "@test/fixtures/equity/EquityFixture";
import { CancelDividendCommandError } from "./error/CancelDividendCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("CancelDividendCommandHandler", () => {
  let handler: CancelDividendCommandHandler;
  let command: CancelDividendCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const accountServiceMock = createMock<AccountService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const accountEvmAddress = EvmAddressPropsFixture.create().value;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CancelDividendCommandHandler(
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = CancelDividendCommandFixture.create();

    accountServiceMock.getCurrentAccount.mockReturnValue({ evmAddress: accountEvmAddress } as any);
    validationServiceMock.checkPause.mockResolvedValue(undefined);
    validationServiceMock.checkRole.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CancelDividendCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CancelDividendCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while cancelling the dividend: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });

    describe("success cases", () => {
      it("should successfully cancel a dividend", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);

        transactionServiceMock.getHandler().cancelDividend.mockResolvedValue({
          id: transactionId,
          error: undefined,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CancelDividendCommandResponse);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);

        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);

        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CORPORATEACTIONS_ROLE,
          accountEvmAddress,
          command.securityId,
        );

        expect(transactionServiceMock.getHandler().cancelDividend).toHaveBeenCalledWith(
          evmAddress,
          command.dividendId,
          command.securityId,
        );

        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
