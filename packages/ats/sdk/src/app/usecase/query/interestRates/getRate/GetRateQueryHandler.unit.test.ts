// SPDX-License-Identifier: Apache-2.0
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { GetRateQueryHandler } from "./GetRateQueryHandler";
import { GetRateQuery, GetRateQueryResponse } from "./GetRateQuery";
import { GetRateQueryError } from "./error/GetRateQueryError";

describe("GetRateQueryHandler", () => {
  let handler: GetRateQueryHandler;
  let query: GetRateQuery;
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const rate = BigInt(1500000);
  const decimals = 6;

  beforeEach(() => {
    handler = new GetRateQueryHandler(queryAdapterServiceMock, accountServiceMock);
    query = new GetRateQuery("security-123");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetRateQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      accountServiceMock.getAccountEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetRateQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying rate: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get rate", async () => {
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getRate.mockResolvedValue([rate, decimals]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetRateQueryResponse);
      expect(result.rate).toBe(rate);
      expect(result.decimals).toBe(decimals);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getRate).toHaveBeenCalledWith(evmAddress);
    });
  });
});
