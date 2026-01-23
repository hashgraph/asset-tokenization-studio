// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { AccountPropsFixture, ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { ComplianceQuery, ComplianceQueryResponse } from "./ComplianceQuery";
import { ComplianceQueryHandler } from "./ComplianceQueryHandler";
import { ComplianceQueryError } from "./error/ComplianceQueryError";
import { ComplianceQueryFixture } from "@test/fixtures/compliance/ComplianceFixture";
import AccountService from "@service/account/AccountService";
import Account from "@domain/context/account/Account";

describe("ComplianceQueryHandler", () => {
  let handler: ComplianceQueryHandler;
  let query: ComplianceQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const compliance = new EvmAddress(EvmAddressPropsFixture.create().value).value;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new ComplianceQueryHandler(queryAdapterServiceMock, contractServiceMock, accountServiceMock);
    query = ComplianceQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws ComplianceQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(ComplianceQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying compliance: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get compliance address", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.compliance.mockResolvedValueOnce(compliance);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(ComplianceQueryResponse);
      expect(result.payload).toBe(account.id.toString());
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.compliance).toHaveBeenCalledWith(evmAddress);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(compliance);
    });
  });
});
