// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import AccountService from "@service/account/AccountService";
import Account from "@domain/context/account/Account";
import { GetExternalPausesMembersQueryHandler } from "./GetExternalPausesMembersQueryHandler";
import { GetExternalPausesMembersQuery, GetExternalPausesMembersQueryResponse } from "./GetExternalPausesMembersQuery";
import { GetExternalPausesMembersQueryFixture } from "@test/fixtures/externalPauses/ExternalPausesFixture";

describe("GetExternalPausesMembersQueryHandler", () => {
  let handler: GetExternalPausesMembersQueryHandler;
  let query: GetExternalPausesMembersQuery;

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
    handler = new GetExternalPausesMembersQueryHandler(
      securityServiceMock,
      accountServiceMock,
      contractServiceMock,
      queryAdapterServiceMock,
    );
    query = GetExternalPausesMembersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully get external pauses members", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getExternalPausesMembers.mockResolvedValue([evmAddress.toString()]);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetExternalPausesMembersQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getExternalPausesMembers).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getExternalPausesMembers).toHaveBeenCalledWith(evmAddress, query.start, query.end);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(evmAddress.toString());
    });
  });
});
