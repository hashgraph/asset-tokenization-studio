// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetExternalControlListsMembersQueryFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { GetExternalControlListsMembersQueryHandler } from "./GetExternalControlListsMembersQueryHandler";
import {
  GetExternalControlListsMembersQuery,
  GetExternalControlListsMembersQueryResponse,
} from "./GetExternalControlListsMembersQuery";
import AccountService from "@service/account/AccountService";
import Account from "@domain/context/account/Account";

describe("GetExternalControlListsMembersQueryHandler", () => {
  let handler: GetExternalControlListsMembersQueryHandler;
  let query: GetExternalControlListsMembersQuery;

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
    handler = new GetExternalControlListsMembersQueryHandler(
      securityServiceMock,
      accountServiceMock,
      contractServiceMock,
      queryAdapterServiceMock,
    );
    query = GetExternalControlListsMembersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully get external control lists members", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getExternalControlListsMembers.mockResolvedValue([evmAddress.toString()]);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetExternalControlListsMembersQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getExternalControlListsMembers).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getExternalControlListsMembers).toHaveBeenCalledWith(
        evmAddress,
        query.start,
        query.end,
      );
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(evmAddress.toString());
    });
  });
});
