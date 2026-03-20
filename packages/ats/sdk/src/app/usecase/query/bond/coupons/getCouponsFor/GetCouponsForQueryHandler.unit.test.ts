// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { CouponFixture, GetCouponsForQueryFixture } from "@test/fixtures/bond/BondFixture";
import { GetCouponsForQueryError } from "./error/GetCouponsForQueryError";
import { GetCouponsForQueryHandler } from "./GetCouponsForQueryHandler";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { CouponAmountFor } from "@domain/context/bond/CouponAmountFor";
import { CouponFor } from "@domain/context/bond/CouponFor";
import { GetCouponsForQuery, GetCouponsForQueryResponse } from "./GetCouponsForQuery";

describe("GetCouponsForQueryHandler", () => {
  let handler: GetCouponsForQueryHandler;
  let query: GetCouponsForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const amount = new BigDecimal("1000000");
  const nominalValue = new BigDecimal("500");
  const decimals = 6;
  const coupon = CouponFixture.create();
  const couponAmount = new CouponAmountFor("10", "4", true);
  const accounts = ["0x1234567890abcdef1234567890abcdef12345678"];

  beforeEach(() => {
    handler = new GetCouponsForQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetCouponsForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCouponsForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCouponsForQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying coupons for: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get coupons for", async () => {
      const couponForDomain = new CouponFor(amount, nominalValue, decimals, true, coupon, couponAmount, false);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getCouponsFor.mockResolvedValue({
        coupons: [couponForDomain],
        accounts,
      });

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCouponsForQueryResponse);
      expect(result.coupons).toHaveLength(1);
      expect(result.coupons[0]).toStrictEqual(couponForDomain);
      expect(result.accounts).toStrictEqual(accounts);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getCouponsFor).toHaveBeenCalledWith(
        evmAddress,
        query.couponId,
        query.pageIndex,
        query.pageLength,
      );
    });
  });
});
