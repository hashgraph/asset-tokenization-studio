// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalCouponHoldersQueryFixture } from "@test/fixtures/bond/BondFixture";
import { EvmAddressPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetTotalCouponHoldersQueryError } from "./error/GetTotalCouponHoldersQueryError";
import { GetTotalCouponHoldersQuery, GetTotalCouponHoldersQueryResponse } from "./GetTotalCouponHoldersQuery";
import { GetTotalCouponHoldersQueryHandler } from "./GetTotalCouponHoldersQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";

describe("GetTotalSecurityHoldersQueryHandler", () => {
  let handler: GetTotalCouponHoldersQueryHandler;
  let query: GetTotalCouponHoldersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetTotalCouponHoldersQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetTotalCouponHoldersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetTotalCouponHoldersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetTotalCouponHoldersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying total coupon holders: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get total coupon holders", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getTotalCouponHolders.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetTotalCouponHoldersQueryResponse);
      expect(result.payload).toStrictEqual(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getTotalCouponHolders).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getTotalCouponHolders).toHaveBeenCalledWith(evmAddress, query.couponId);
    });
  });
});
