// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetKycAccountsDataQueryFixture, KycAccountDataFixture } from "@test/fixtures/kyc/KycFixture";
import { GetKycAccountsDataQuery, GetKycAccountsDataQueryResponse } from "./GetKycAccountsDataQuery";
import { GetKycAccountsDataQueryHandler } from "./GetKycAccountsDataQueryHandler";
import AccountService from "@service/account/AccountService";
import { GetKycAccountsDataQueryError } from "./error/GetKycAccountsDataQueryError";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";

describe("GetKycAccountsDataQueryHandler", () => {
  let handler: GetKycAccountsDataQueryHandler;
  let query: GetKycAccountsDataQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const issuer = new Account(AccountPropsFixture.create());
  const account = new Account(AccountPropsFixture.create());

  const errorMsg = ErrorMsgFixture.create().msg;
  const kycAccount = KycAccountDataFixture.create();

  beforeEach(() => {
    handler = new GetKycAccountsDataQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetKycAccountsDataQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetKycAccountsDataQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetKycAccountsDataQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying KYC accounts data: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get kyc accounts data", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(issuer).mockResolvedValueOnce(account);
      queryAdapterServiceMock.getKycAccountsData.mockResolvedValueOnce([kycAccount]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetKycAccountsDataQueryResponse);

      const expectedResult = {
        ...kycAccount,
        issuer: issuer.id.toString(),
        account: account.id.toString(),
      };

      expect(result.payload).toStrictEqual([expectedResult]);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(2);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);

      expect(accountServiceMock.getAccountInfo).toHaveBeenNthCalledWith(1, kycAccount.issuer);
      expect(accountServiceMock.getAccountInfo).toHaveBeenNthCalledWith(2, kycAccount.account);
      expect(queryAdapterServiceMock.getKycAccountsData).toHaveBeenCalledWith(
        evmAddress,
        query.kycStatus,
        query.start,
        query.end,
      );
    });
  });
});
