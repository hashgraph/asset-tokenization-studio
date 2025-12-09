//SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetCouponForQueryFixture } from "@test/fixtures/bond/BondFixture";
import { GetCouponForQueryError } from "./error/GetCouponForQueryError";
import { GetCouponForQueryHandler } from "./GetCouponForQueryHandler";
import AccountService from "@service/account/AccountService";
import BigDecimal from "@domain/context/shared/BigDecimal";
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
  const decimals = 6;

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
      queryAdapterServiceMock.getCouponFor.mockResolvedValue({ tokenBalance: amount, decimals: decimals });

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCouponForQueryResponse);
      expect(result.tokenBalance).toStrictEqual(amount);
      expect(result.decimals).toStrictEqual(decimals);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getCouponFor).toHaveBeenCalledWith(evmAddress, targetEvmAddress, query.couponId);
    });
  });
});
