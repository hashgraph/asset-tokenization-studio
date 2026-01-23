// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetCouponAmountForQueryFixture } from "@test/fixtures/bond/BondFixture";
import { GetCouponAmountForQueryError } from "./error/GetCouponAmountForQueryError";
import { GetCouponAmountForQueryHandler } from "./GetCouponAmountForQueryHandler";
import AccountService from "@service/account/AccountService";
import { GetCouponAmountForQuery, GetCouponAmountForQueryResponse } from "./GetCouponAmountForQuery";

describe("GetCouponAmountForQueryHandler", () => {
  let handler: GetCouponAmountForQueryHandler;
  let query: GetCouponAmountForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;
  const numerator = "1";
  const denominator = "2";
  const recordDateReached = true;

  beforeEach(() => {
    handler = new GetCouponAmountForQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetCouponAmountForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCouponAmountForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCouponAmountForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying account's coupon amount: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get coupon for amount", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getCouponAmountFor.mockResolvedValue({
        numerator,
        denominator,
        recordDateReached,
      });

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCouponAmountForQueryResponse);
      expect(result.numerator).toStrictEqual(numerator);
      expect(result.denominator).toStrictEqual(denominator);
      expect(result.recordDateReached).toStrictEqual(recordDateReached);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getCouponAmountFor).toHaveBeenCalledWith(
        evmAddress,
        targetEvmAddress,
        query.couponId,
      );
    });
  });
});
