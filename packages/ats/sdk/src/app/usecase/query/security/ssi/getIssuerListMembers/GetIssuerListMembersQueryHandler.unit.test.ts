// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetIssuerListMembersQuery, GetIssuerListMembersQueryResponse } from "./GetIssuerListMembersQuery";
import { GetIssuerListMembersQueryHandler } from "./GetIssuerListMembersQueryHandler";
import AccountService from "@service/account/AccountService";
import { GetIssuerListMembersQueryFixture } from "@test/fixtures/ssi/SsiFixture";
import { GetIssuerListMembersQueryError } from "./error/GetIssuerListMembersQueryError";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";

describe("GetIssuerListMembersQueryHandler", () => {
  let handler: GetIssuerListMembersQueryHandler;
  let query: GetIssuerListMembersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account(AccountPropsFixture.create());
  const member = new EvmAddress(EvmAddressPropsFixture.create().value).toString();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetIssuerListMembersQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetIssuerListMembersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetIssuerListMembersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetIssuerListMembersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying issuer list members: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get issuer list members", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);
      queryAdapterServiceMock.getIssuerListMembers.mockResolvedValueOnce([member]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetIssuerListMembersQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(member);
      expect(queryAdapterServiceMock.getIssuerListMembers).toHaveBeenCalledWith(evmAddress, query.start, query.end);
    });
  });
});
