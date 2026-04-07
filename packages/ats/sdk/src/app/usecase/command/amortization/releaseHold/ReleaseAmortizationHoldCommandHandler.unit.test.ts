// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ReleaseAmortizationHoldCommandHandler } from "./ReleaseAmortizationHoldCommandHandler";
import {
  ReleaseAmortizationHoldCommand,
  ReleaseAmortizationHoldCommandResponse,
} from "./ReleaseAmortizationHoldCommand";
import TransactionService from "@service/transaction/TransactionService";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { ErrorMsgFixture, EvmAddressPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import { ReleaseAmortizationHoldCommandError } from "./error/ReleaseAmortizationHoldCommandError";
import { ErrorCode } from "@core/error/BaseError";
import { ReleaseAmortizationHoldCommandFixture } from "@test/fixtures/amortization/AmortizationFixture";

describe("ReleaseAmortizationHoldCommandHandler", () => {
  let handler: ReleaseAmortizationHoldCommandHandler;
  let command: ReleaseAmortizationHoldCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const accountServiceMock = createMock<AccountService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();

  const transactionId = TransactionIdFixture.create().id;
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const accountEvmAddress = EvmAddressPropsFixture.create().value;
  const tokenHolderEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new ReleaseAmortizationHoldCommandHandler(
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = ReleaseAmortizationHoldCommandFixture.create();

    accountServiceMock.getCurrentAccount.mockReturnValue({ evmAddress: accountEvmAddress } as any);
    validationServiceMock.checkPause.mockResolvedValue(undefined);
    validationServiceMock.checkRole.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws ReleaseAmortizationHoldCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(ReleaseAmortizationHoldCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while releasing the amortization hold: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });

    describe("success cases", () => {
      it("should successfully release amortization hold", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getAccountEvmAddress.mockResolvedValue(tokenHolderEvmAddress);

        transactionServiceMock.getHandler().releaseAmortizationHold.mockResolvedValue({
          id: transactionId,
          error: undefined,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(ReleaseAmortizationHoldCommandResponse);

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

        expect(transactionServiceMock.getHandler().releaseAmortizationHold).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().releaseAmortizationHold).toHaveBeenCalledWith(
          evmAddress,
          command.amortizationId,
          tokenHolderEvmAddress,
          command.securityId,
        );

        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);
      });
    });
  });
});
