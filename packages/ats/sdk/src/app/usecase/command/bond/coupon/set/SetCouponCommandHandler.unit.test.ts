// SPDX-License-Identifier: Apache-2.0

import { SetCouponCommand, SetCouponCommandResponse } from "./SetCouponCommand";
import { SetCouponCommandHandler } from "./SetCouponCommandHandler";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { SetCouponCommandFixture } from "@test/fixtures/bond/BondFixture";
import { createMock } from "@golevelup/ts-jest";
import TransactionService from "@service/transaction/TransactionService";
import {
  CouponIdFixture,
  ErrorMsgFixture,
  EvmAddressPropsFixture,
  TransactionIdFixture,
} from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SetCouponCommandError } from "./error/SetCouponCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("SetCouponCommandHandler", () => {
  let handler: SetCouponCommandHandler;
  let command: SetCouponCommand;
  const transactionServiceMock = createMock<TransactionService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const transactionId = TransactionIdFixture.create().id;
  const couponId = CouponIdFixture.create().id;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetCouponCommandHandler(transactionServiceMock, contractServiceMock);
    command = SetCouponCommandFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetCouponCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetCouponCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while setting the coupon: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("successfully sets coupon", async () => {
        setupContractEvmAddressMock();
        setupSuccessfulTransactionMock();
        setupSuccesfulTransactionResultMock();

        const result = await handler.execute(command);

        expectSuccessfulResponse(result);
        expectTransactionServiceCall(command, evmAddress);
        expect(transactionServiceMock.getHandler().setCoupon).toHaveBeenCalledTimes(1);
        expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledTimes(1);
      });
    });
  });

  function setupContractEvmAddressMock(): void {
    contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
  }

  function setupSuccessfulTransactionMock(): void {
    transactionServiceMock.getHandler().setCoupon.mockResolvedValue({
      id: transactionId,
      response: { couponID: couponId },
    });
  }

  function setupSuccesfulTransactionResultMock(): void {
    transactionServiceMock.getTransactionResult.mockResolvedValue(couponId);
  }

  function expectSuccessfulResponse(result: SetCouponCommandResponse): void {
    expect(result).toBeInstanceOf(SetCouponCommandResponse);
    expect(result.payload).toBe(parseInt(couponId, 16));
    expect(result.transactionId).toBe(transactionId);
  }

  function expectTransactionServiceCall(
    command: ReturnType<typeof SetCouponCommandFixture.create>,
    expectedAddress: { value: string },
  ): void {
    expect(transactionServiceMock.getHandler().setCoupon).toHaveBeenCalledWith(
      expectedAddress,
      BigDecimal.fromString(command.recordDate),
      BigDecimal.fromString(command.executionDate),
      BigDecimal.fromString(command.rate),
      BigDecimal.fromString(command.startDate),
      BigDecimal.fromString(command.endDate),
      BigDecimal.fromString(command.fixingDate),
      command.rateStatus,
      command.address,
    );
    expect(transactionServiceMock.getTransactionResult).toHaveBeenCalledWith(
      expect.objectContaining({
        res: {
          id: transactionId,
          response: { couponID: couponId },
        },
        result: couponId,
        className: SetCouponCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      }),
    );
  }
});
