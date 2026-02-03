// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { EquityDetailsFixture, GetEquityDetailsQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { GetEquityDetailsQueryHandler } from "./GetEquityDetailsQueryHandler";
import { GetEquityDetailsQuery, GetEquityDetailsQueryResponse } from "./GetEquityDetailsQuery";
import AccountService from "@service/account/AccountService";
import { GetEquityDetailsQueryError } from "./error/GetEquityDetailsQueryError";

describe("GetEquityDetailsQueryHandler", () => {
  let handler: GetEquityDetailsQueryHandler;
  let query: GetEquityDetailsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const equityDetails = EquityDetailsFixture.create();

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetEquityDetailsQueryHandler(queryAdapterServiceMock, accountServiceMock);
    query = GetEquityDetailsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetEquityDetailsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      accountServiceMock.getAccountEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetEquityDetailsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying equity details: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get equity details", async () => {
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getEquityDetails.mockResolvedValue(equityDetails);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetEquityDetailsQueryResponse);
      expect(result.equity).toBe(equityDetails);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.equityId);
      expect(queryAdapterServiceMock.getEquityDetails).toHaveBeenCalledWith(evmAddress);
    });
  });
});
