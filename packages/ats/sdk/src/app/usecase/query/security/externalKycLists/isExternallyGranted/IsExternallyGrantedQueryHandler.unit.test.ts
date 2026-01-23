// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { IsExternallyGrantedQueryHandler } from "./IsExternallyGrantedQueryHandler";
import { IsExternallyGrantedQuery, IsExternallyGrantedQueryResponse } from "./IsExternallyGrantedQuery";
import AccountService from "@service/account/AccountService";
import { IsExternallyGrantedQueryFixture } from "@test/fixtures/externalKycLists/ExternalKycListsFixture";

describe("IsExternallyGrantedQueryHandler", () => {
  let handler: IsExternallyGrantedQueryHandler;
  let query: IsExternallyGrantedQuery;

  const securityServiceMock = createMock<SecurityService>();
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new IsExternallyGrantedQueryHandler(
      securityServiceMock,
      contractServiceMock,
      accountServiceMock,
      queryAdapterServiceMock,
    );
    query = IsExternallyGrantedQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully validate if is externally granted", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      queryAdapterServiceMock.isExternallyGranted.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsExternallyGrantedQueryResponse);
      expect(result.payload).toBe(true);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.isExternallyGranted).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);

      expect(queryAdapterServiceMock.isExternallyGranted).toHaveBeenCalledWith(
        evmAddress,
        query.kycStatus,
        targetEvmAddress,
      );
    });
  });
});
