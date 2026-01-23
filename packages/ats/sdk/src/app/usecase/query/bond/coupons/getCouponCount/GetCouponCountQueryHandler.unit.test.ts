// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetCouponCountQueryFixture } from "@test/fixtures/bond/BondFixture";
import { GetCouponCountQueryHandler } from "./GetCouponCountQueryHandler";
import { GetCouponCountQuery, GetCouponCountQueryResponse } from "./GetCouponCountQuery";
import { GetCouponCountQueryError } from "./error/GetCouponCountQueryError";

describe("GetCouponCountQueryHandler", () => {
  let handler: GetCouponCountQueryHandler;
  let query: GetCouponCountQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetCouponCountQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetCouponCountQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCouponCountQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCouponCountQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying coupon count: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get coupon count", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getCouponCount.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCouponCountQueryResponse);
      expect(result.payload).toBe(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getCouponCount).toHaveBeenCalledWith(evmAddress);
    });
  });
});
