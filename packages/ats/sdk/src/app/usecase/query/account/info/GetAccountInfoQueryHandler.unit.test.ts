// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { AccountPropsFixture, GetAccountInfoQueryFixture } from "@test/fixtures/account/AccountFixture";
import { ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { GetAccountInfoQueryHandler } from "./GetAccountInfoQueryHandler";
import { GetAccountInfoQuery, GetAccountInfoQueryResponse } from "./GetAccountInfoQuery";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Account from "@domain/context/account/Account";
import { GetAccountInfoQueryError } from "./error/GetAccountInfoQueryError";

describe("GetAccountInfoQueryHandler", () => {
  let handler: GetAccountInfoQueryHandler;
  let query: GetAccountInfoQuery;

  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();

  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new GetAccountInfoQueryHandler(mirrorNodeAdapterMock);
    query = GetAccountInfoQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetAccountInfoQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      mirrorNodeAdapterMock.getAccountInfo.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetAccountInfoQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying account info: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get account info", async () => {
      mirrorNodeAdapterMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetAccountInfoQueryResponse);
      expect(result.account).toBe(account);
      expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(mirrorNodeAdapterMock.getAccountInfo).toHaveBeenCalledWith(query.id);
    });
  });
});
