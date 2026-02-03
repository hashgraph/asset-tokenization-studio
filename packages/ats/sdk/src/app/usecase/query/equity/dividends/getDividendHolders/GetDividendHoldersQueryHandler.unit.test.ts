// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetDividendHoldersQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { EvmAddressPropsFixture, AccountPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetDividendHoldersQueryError } from "./error/GetDividendHoldersQueryError";
import { GetDividendHoldersQuery, GetDividendHoldersQueryResponse } from "./GetDividendHoldersQuery";
import { GetDividendHoldersQueryHandler } from "./GetDividendHoldersQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";
import Account from "@domain/context/account/Account";

describe("GetDividendHoldersQueryHandler", () => {
  let handler: GetDividendHoldersQueryHandler;
  let query: GetDividendHoldersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetDividendHoldersQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetDividendHoldersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetDividendHoldersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetDividendHoldersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying dividend holders: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get dividend holders", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getDividendHolders.mockResolvedValue([evmAddress.toString()]);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetDividendHoldersQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getDividendHolders).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getDividendHolders).toHaveBeenCalledWith(
        evmAddress,
        query.dividendId,
        query.start,
        query.end,
      );
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(evmAddress.toString());
    });
  });
});
