// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetCouponQueryHandler } from "./GetCouponQueryHandler";
import { GetCouponQuery, GetCouponQueryResponse } from "./GetCouponQuery";
import { CouponFixture, GetCouponQueryFixture } from "@test/fixtures/bond/BondFixture";
import { GetCouponQueryError } from "./error/GetCouponQueryError";

describe("GetCouponQueryHandler", () => {
  let handler: GetCouponQueryHandler;
  let query: GetCouponQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const coupon = CouponFixture.create();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetCouponQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetCouponQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCouponQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCouponQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying coupons: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get coupon info", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getCoupon.mockResolvedValue(coupon);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCouponQueryResponse);
      expect(result.coupon).toBe(coupon);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getCoupon).toHaveBeenCalledWith(evmAddress, query.couponId);
    });
  });
});
