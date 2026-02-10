// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetScheduledCouponListingQueryHandler } from "./GetScheduledCouponListingQueryHandler";
import {
  GetScheduledCouponListingQuery,
  GetScheduledCouponListingQueryResponse,
} from "./GetScheduledCouponListingQuery";
import { GetScheduledCouponListingQueryError } from "./error/GetScheduledCouponListingQueryError";

describe("GetScheduledCouponListingQueryHandler", () => {
  let handler: GetScheduledCouponListingQueryHandler;
  let query: GetScheduledCouponListingQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const scheduledCouponListing = { id: 1, date: "2023-01-01" };
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetScheduledCouponListingQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = new GetScheduledCouponListingQuery("test-security-id", 0, 10);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetScheduledCouponListingQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetScheduledCouponListingQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying scheduled coupon listing: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get scheduled coupon listing", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getScheduledCouponListing.mockResolvedValue(scheduledCouponListing);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetScheduledCouponListingQueryResponse);
      expect(result.scheduledCouponListing).toBe(scheduledCouponListing);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getScheduledCouponListing).toHaveBeenCalledWith(
        evmAddress,
        query.pageIndex,
        query.pageLength,
      );
    });
  });
});
