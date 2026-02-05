// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetCouponFromOrderedListAtQueryFixture } from "@test/fixtures/bond/BondFixture";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { GetCouponFromOrderedListAtQueryError } from "./error/GetCouponFromOrderedListAtQueryError";
import {
  GetCouponFromOrderedListAtQuery,
  GetCouponFromOrderedListAtQueryResponse,
} from "./GetCouponFromOrderedListAtQuery";
import { GetCouponFromOrderedListAtQueryHandler } from "./GetCouponFromOrderedListAtQueryHandler";

describe("GetCouponFromOrderedListAtQueryHandler", () => {
  let handler: GetCouponFromOrderedListAtQueryHandler;
  let query: GetCouponFromOrderedListAtQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetCouponFromOrderedListAtQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetCouponFromOrderedListAtQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCouponFromOrderedListAtQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCouponFromOrderedListAtQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while querying coupon from ordered list at position: ${errorMsg}`,
        ),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get coupon holders", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getCouponFromOrderedListAt.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCouponFromOrderedListAtQueryResponse);
      expect(result.couponId).toStrictEqual(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getCouponFromOrderedListAt).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getCouponFromOrderedListAt).toHaveBeenCalledWith(evmAddress, query.pos);
    });
  });
});
