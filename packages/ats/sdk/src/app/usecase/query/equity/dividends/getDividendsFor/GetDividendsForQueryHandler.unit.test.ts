// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { DividendForFixture, GetDividendsForQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { GetDividendsForQueryHandler } from "./GetDividendsForQueryHandler";
import { GetDividendsForQuery, GetDividendsForQueryResponse } from "./GetDividendsForQuery";
import AccountService from "@service/account/AccountService";
import { GetDividendsForQueryError } from "./error/GetDividendsForQueryError";

describe("GetDividendsForQueryHandler", () => {
  let handler: GetDividendsForQueryHandler;
  let query: GetDividendsForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const dividendFor = DividendForFixture.create();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetDividendsForQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetDividendsForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetDividendsForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetDividendsForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying account's dividends: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get dividends for", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getDividendsFor.mockResolvedValue(dividendFor);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetDividendsForQueryResponse);
      expect(result.tokenBalance).toBe(dividendFor.tokenBalance);
      expect(result.decimals).toBe(dividendFor.decimals);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getDividendsFor).toHaveBeenCalledWith(
        evmAddress,
        targetEvmAddress,
        query.dividendId,
      );
    });
  });
});
