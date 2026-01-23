// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { DividendFixture, GetDividendsQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { GetDividendsQueryHandler } from "./GetDividendsQueryHandler";
import { GetDividendsQuery, GetDividendsQueryResponse } from "./GetDividendsQuery";
import { GetDividendsQueryError } from "./error/GetDividendsQueryError";

describe("GetDividendsQueryHandler", () => {
  let handler: GetDividendsQueryHandler;
  let query: GetDividendsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const dividend = DividendFixture.create();

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetDividendsQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetDividendsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetDividendsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetDividendsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying dividends: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get dividends", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getDividends.mockResolvedValue(dividend);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetDividendsQueryResponse);
      expect(result.dividend).toBe(dividend);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getDividends).toHaveBeenCalledWith(evmAddress, query.dividendId);
    });
  });
});
