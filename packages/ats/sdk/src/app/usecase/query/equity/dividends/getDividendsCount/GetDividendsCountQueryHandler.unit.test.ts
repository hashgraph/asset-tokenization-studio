// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetDividendsCountQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { GetDividendsCountQueryHandler } from "./GetDividendsCountQueryHandler";
import { GetDividendsCountQueryError } from "./error/GetDividendsCountQueryError";
import { GetDividendsCountQuery, GetDividendsCountQueryResponse } from "./GetDividendsCountQuery";

describe("GetDividendsCountQueryHandler", () => {
  let handler: GetDividendsCountQueryHandler;
  let query: GetDividendsCountQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetDividendsCountQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetDividendsCountQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetDividendsCountQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetDividendsCountQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying dividends count: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get dividends count", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getDividendsCount.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetDividendsCountQueryResponse);
      expect(result.payload).toBe(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getDividendsCount).toHaveBeenCalledWith(evmAddress);
    });
  });
});
