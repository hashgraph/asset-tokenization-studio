// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { BondDetailsFixture, GetBondDetailsQueryFixture } from "@test/fixtures/bond/BondFixture";
import AccountService from "@service/account/AccountService";
import { GetBondDetailsQueryHandler } from "./GetBondDetailsQueryHandler";
import { GetBondDetailsQuery, GetBondDetailsQueryResponse } from "./GetBondDetailsQuery";
import { GetBondDetailsQueryError } from "./error/GetBondDetailsQueryError";

describe("GetBondDetailsQueryHandler", () => {
  let handler: GetBondDetailsQueryHandler;
  let query: GetBondDetailsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;
  const bondDetails = BondDetailsFixture.create();

  beforeEach(() => {
    handler = new GetBondDetailsQueryHandler(queryAdapterServiceMock, accountServiceMock);
    query = GetBondDetailsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetBondDetailsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      accountServiceMock.getAccountEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetBondDetailsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying bond details: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get bond details", async () => {
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getBondDetails.mockResolvedValue(bondDetails);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetBondDetailsQueryResponse);
      expect(result.bond).toBe(bondDetails);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.bondId);
      expect(queryAdapterServiceMock.getBondDetails).toHaveBeenCalledWith(evmAddress);
    });
  });
});
