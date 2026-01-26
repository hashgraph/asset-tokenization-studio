// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { GetExternalKycListsMembersQueryHandler } from "./GetExternalKycListsMembersQueryHandler";
import {
  GetExternalKycListsMembersQuery,
  GetExternalKycListsMembersQueryResponse,
} from "./GetExternalKycListsMembersQuery";
import AccountService from "@service/account/AccountService";
import Account from "@domain/context/account/Account";
import { GetExternalKycListsMembersQueryFixture } from "@test/fixtures/externalKycLists/ExternalKycListsFixture";

describe("GetExternalKycListsMembersQueryHandler", () => {
  let handler: GetExternalKycListsMembersQueryHandler;
  let query: GetExternalKycListsMembersQuery;

  const securityServiceMock = createMock<SecurityService>();
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account({
    id: HederaIdPropsFixture.create().value,
    evmAddress: EvmAddressPropsFixture.create().value,
  });
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new GetExternalKycListsMembersQueryHandler(
      securityServiceMock,
      accountServiceMock,
      contractServiceMock,
      queryAdapterServiceMock,
    );
    query = GetExternalKycListsMembersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully get external kyc lists members", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getExternalKycListsMembers.mockResolvedValue([evmAddress.toString()]);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetExternalKycListsMembersQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getExternalKycListsMembers).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getExternalKycListsMembers).toHaveBeenCalledWith(
        evmAddress,
        query.start,
        query.end,
      );
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(evmAddress.toString());
    });
  });
});
