// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { GetRevocationRegistryAddressQueryFixture } from "@test/fixtures/ssi/SsiFixture";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import {
  GetRevocationRegistryAddressQuery,
  GetRevocationRegistryAddressQueryResponse,
} from "./GetRevocationRegistryAddressQuery";
import { GetRevocationRegistryAddressQueryHandler } from "./GetRevocationRegistryAddressQueryHandler";
import { GetRevocationRegistryAddressQueryError } from "./error/GetRevocationRegistryAddressQueryError";

describe("GetRevocationRegistryAddressQueryHandler", () => {
  let handler: GetRevocationRegistryAddressQueryHandler;
  let query: GetRevocationRegistryAddressQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account(AccountPropsFixture.create());
  const revocation = new EvmAddress(EvmAddressPropsFixture.create().value).toString();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetRevocationRegistryAddressQueryHandler(
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetRevocationRegistryAddressQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetRevocationRegistryAddressQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetRevocationRegistryAddressQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying revocation registry address: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get revocation registry address", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);
      queryAdapterServiceMock.getRevocationRegistryAddress.mockResolvedValueOnce(revocation);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetRevocationRegistryAddressQueryResponse);
      expect(result.payload).toStrictEqual(account.id.toString());
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(revocation);
      expect(queryAdapterServiceMock.getRevocationRegistryAddress).toHaveBeenCalledWith(evmAddress);
    });
  });
});
