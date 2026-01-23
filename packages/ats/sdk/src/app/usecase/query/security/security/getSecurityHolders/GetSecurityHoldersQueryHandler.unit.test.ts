// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetSecurityHoldersQueryFixture } from "@test/fixtures/security/SecurityFixture";
import { EvmAddressPropsFixture, AccountPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetSecurityHoldersQueryError } from "./error/GetSecurityHoldersQueryError";
import { GetSecurityHoldersQuery, GetSecurityHoldersQueryResponse } from "./GetSecurityHoldersQuery";
import { GetSecurityHoldersQueryHandler } from "./GetSecurityHoldersQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";
import Account from "@domain/context/account/Account";

describe("GetSecurityHoldersQueryHandler", () => {
  let handler: GetSecurityHoldersQueryHandler;
  let query: GetSecurityHoldersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetSecurityHoldersQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetSecurityHoldersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetSecurityHoldersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetSecurityHoldersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying security holders: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get token holders for security", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getSecurityHolders.mockResolvedValue([evmAddress.toString()]);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetSecurityHoldersQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getSecurityHolders).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getSecurityHolders).toHaveBeenCalledWith(evmAddress, query.start, query.end);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(evmAddress.toString());
    });
  });
});
