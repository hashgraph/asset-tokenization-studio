//SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { CouponFixture, GetCouponForQueryFixture } from "@test/fixtures/bond/BondFixture";
import { GetCouponForQueryError } from "./error/GetCouponForQueryError";
import { GetCouponForQueryHandler } from "./GetCouponForQueryHandler";
import AccountService from "@service/account/AccountService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { CouponAmountFor } from "@domain/context/bond/CouponAmountFor";
import { GetCouponForQuery, GetCouponForQueryResponse } from "./GetCouponForQuery";

describe("GetCouponForQueryHandler", () => {
  let handler: GetCouponForQueryHandler;
  let query: GetCouponForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;
  const amount = new BigDecimal("1000000");
  const nominalValue = new BigDecimal("500");
  const decimals = 6;
  const coupon = CouponFixture.create();
  const couponAmount = new CouponAmountFor("10", "4", true);

  beforeEach(() => {
    handler = new GetCouponForQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetCouponForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCouponForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCouponForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying account's coupon: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get coupon for", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getCouponFor.mockResolvedValue({
        tokenBalance: amount,
        nominalValue: nominalValue,
        decimals: decimals,
        recordDateReached: false,
        coupon: coupon,
        couponAmount: couponAmount,
        isDisabled: false,
      });

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCouponForQueryResponse);
      expect(result.couponFor.tokenBalance).toStrictEqual(amount);
      expect(result.couponFor.nominalValue).toStrictEqual(nominalValue);
      expect(result.couponFor.decimals).toStrictEqual(decimals);
      expect(result.couponFor.recordDateReached).toBe(false);
      expect(result.couponFor.coupon).toStrictEqual(coupon);
      expect(result.couponFor.couponAmount).toStrictEqual(couponAmount);
      expect(result.couponFor.isDisabled).toBe(false);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getCouponFor).toHaveBeenCalledWith(evmAddress, targetEvmAddress, query.couponId);
    });
  });
});
