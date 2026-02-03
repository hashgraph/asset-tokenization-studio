// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetDividendAmountForQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { GetDividendAmountForQueryError } from "./error/GetDividendAmountForQueryError";
import { GetDividendAmountForQueryHandler } from "./GetDividendAmountForQueryHandler";
import AccountService from "@service/account/AccountService";
import { GetDividendAmountForQuery, GetDividendAmountForQueryResponse } from "./GetDividendAmountForQuery";

describe("GetDividendAmountForQueryHandler", () => {
  let handler: GetDividendAmountForQueryHandler;
  let query: GetDividendAmountForQuery;

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
    handler = new GetDividendAmountForQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetDividendAmountForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetDividendAmountForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetDividendAmountForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying account's dividend amount: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get dividend for amount", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getDividendAmountFor.mockResolvedValue({
        numerator,
        denominator,
        recordDateReached,
      });

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetDividendAmountForQueryResponse);
      expect(result.numerator).toStrictEqual(numerator);
      expect(result.denominator).toStrictEqual(denominator);
      expect(result.recordDateReached).toStrictEqual(recordDateReached);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getDividendAmountFor).toHaveBeenCalledWith(
        evmAddress,
        targetEvmAddress,
        query.dividendId,
      );
    });
  });
});
