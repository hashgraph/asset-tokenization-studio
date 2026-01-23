// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { GetTokenBySaltQuery, GetTokenBySaltQueryResponse } from "./GetTokenBySaltQuery";
import { GetTokenBySaltQueryHandler } from "./GetTokenBySaltQueryHandler";
import { GetTokenBySaltQueryError } from "./error/GetTokenBySaltQueryError";
import { GetTokenQueryFixture } from "@test/fixtures/trexFactroy/TrexFactoryFixture";

describe("GetTokenBySaltQueryHandler", () => {
  let handler: GetTokenBySaltQueryHandler;
  let query: GetTokenBySaltQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const Token = EvmAddressPropsFixture.create().value;

  beforeEach(() => {
    handler = new GetTokenBySaltQueryHandler(queryAdapterServiceMock, accountServiceMock);
    query = GetTokenQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetTokenQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      accountServiceMock.getAccountEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetTokenBySaltQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying token salt: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get factory token by salt", async () => {
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getTrexTokenBySalt.mockResolvedValue(Token);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetTokenBySaltQueryResponse);
      expect(result.token).toBe(Token);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.factory?.toString());
      expect(queryAdapterServiceMock.getTrexTokenBySalt).toHaveBeenCalledWith(evmAddress, query.salt);
    });
  });
});
