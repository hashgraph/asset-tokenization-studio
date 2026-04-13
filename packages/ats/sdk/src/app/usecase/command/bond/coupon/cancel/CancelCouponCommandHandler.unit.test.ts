// SPDX-License-Identifier: Apache-2.0

import { CancelCouponCommand, CancelCouponCommandResponse } from "./CancelCouponCommand";
import { CancelCouponCommandHandler } from "./CancelCouponCommandHandler";
import { CancelCouponCommandFixture } from "@test/fixtures/bond/BondFixture";
import { createMock } from "@golevelup/ts-jest";
import TransactionService from "@service/transaction/TransactionService";
import { AccountPropsFixture, ErrorMsgFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import Account from "@domain/context/account/Account";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { CancelCouponCommandError } from "./error/CancelCouponCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("CancelCouponCommandHandler", () => {
  let handler: CancelCouponCommandHandler;
  let command: CancelCouponCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const accountServiceMock = createMock<AccountService>();
  const validationServiceMock = createMock<ValidationService>();
  const contractServiceMock = createMock<ContractService>();

  const account = new Account(AccountPropsFixture.create());
  const evmAddress = new EvmAddress(account.evmAddress!);
  const transactionId = TransactionIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new CancelCouponCommandHandler(
      transactionServiceMock,
      accountServiceMock,
      validationServiceMock,
      contractServiceMock,
    );
    command = CancelCouponCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws CancelCouponCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(CancelCouponCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while cancelling the coupon: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("successfully cancels coupon", async () => {
        contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
        accountServiceMock.getCurrentAccount.mockReturnValue(account);
        transactionServiceMock.getHandler().cancelCoupon.mockResolvedValue({
          id: transactionId,
        });

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(CancelCouponCommandResponse);
        expect(result.payload).toBe(true);
        expect(result.transactionId).toBe(transactionId);

        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
        expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(command.securityId);

        expect(validationServiceMock.checkPause).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkPause).toHaveBeenCalledWith(command.securityId);

        expect(validationServiceMock.checkRole).toHaveBeenCalledTimes(1);
        expect(validationServiceMock.checkRole).toHaveBeenCalledWith(
          SecurityRole._CORPORATEACTIONS_ROLE,
          account.evmAddress,
          command.securityId,
        );

        expect(transactionServiceMock.getHandler().cancelCoupon).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getHandler().cancelCoupon).toHaveBeenCalledWith(
          evmAddress,
          command.couponId,
          command.securityId,
        );
      });
    });
  });
});
