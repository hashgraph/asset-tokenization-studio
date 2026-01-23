// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IdentityRegistryQuery, IdentityRegistryQueryResponse } from "./IdentityRegistryQuery";
import { IdentityRegistryQueryHandler } from "./IdentityRegistryQueryHandler";
import { IdentityRegistryQueryError } from "./error/IdentityRegistryQueryError";
import { IdentityRegistryQueryFixture } from "@test/fixtures/identityRegistry/IdentityRegistryFixture";
import AccountService from "@service/account/AccountService";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import Account from "@domain/context/account/Account";

describe("IdentityRegistryQueryHandler", () => {
  let handler: IdentityRegistryQueryHandler;
  let query: IdentityRegistryQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const identityRegistry = new EvmAddress(EvmAddressPropsFixture.create().value).value;
  const errorMsg = ErrorMsgFixture.create().msg;
  const account = new Account(AccountPropsFixture.create());

  beforeEach(() => {
    handler = new IdentityRegistryQueryHandler(queryAdapterServiceMock, contractServiceMock, accountServiceMock);
    query = IdentityRegistryQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws IdentityRegistryQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(IdentityRegistryQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying identity registry: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get identity registry address", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.identityRegistry.mockResolvedValueOnce(identityRegistry);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IdentityRegistryQueryResponse);
      expect(result.payload).toBe(account.id.toString());
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.identityRegistry).toHaveBeenCalledWith(evmAddress);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(identityRegistry);
    });
  });
});
