// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalDividendHoldersQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { EvmAddressPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetTotalDividendHoldersQueryError } from "./error/GetTotalDividendHoldersQueryError";
import { GetTotalDividendHoldersQuery, GetTotalDividendHoldersQueryResponse } from "./GetTotalDividendHoldersQuery";
import { GetTotalDividendHoldersQueryHandler } from "./GetTotalDividendHoldersQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";

describe("GetTotalDividendHoldersQueryHandler", () => {
  let handler: GetTotalDividendHoldersQueryHandler;
  let query: GetTotalDividendHoldersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetTotalDividendHoldersQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetTotalDividendHoldersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetTotalDividendHoldersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetTotalDividendHoldersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying total dividend holders: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get total dividend holders", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getTotalDividendHolders.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetTotalDividendHoldersQueryResponse);
      expect(result.payload).toStrictEqual(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getTotalDividendHolders).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getTotalDividendHolders).toHaveBeenCalledWith(evmAddress, query.dividendId);
    });
  });
});
