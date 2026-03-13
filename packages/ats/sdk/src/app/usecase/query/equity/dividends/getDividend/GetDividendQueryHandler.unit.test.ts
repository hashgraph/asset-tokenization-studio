// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { DividendFixture, GetDividendQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { GetDividendQueryHandler } from "./GetDividendQueryHandler";
import { GetDividendQuery, GetDividendQueryResponse } from "./GetDividendQuery";
import { GetDividendQueryError } from "./error/GetDividendQueryError";

describe("GetDividendQueryHandler", () => {
  let handler: GetDividendQueryHandler;
  let query: GetDividendQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const dividend = DividendFixture.create();

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetDividendQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetDividendQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetDividendQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetDividendQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying dividends: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get dividend", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getDividend.mockResolvedValue(dividend);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetDividendQueryResponse);
      expect(result.dividend).toBe(dividend);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getDividend).toHaveBeenCalledWith(evmAddress, query.dividendId);
    });
  });
});
