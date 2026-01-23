// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { IsExternalKycListQueryHandler } from "./IsExternalKycListQueryHandler";
import { IsExternalKycListQuery, IsExternalKycListQueryResponse } from "./IsExternalKycListQuery";
import { IsExternalKycListQueryFixture } from "@test/fixtures/externalKycLists/ExternalKycListsFixture";

describe("IsExternalKycListQueryHandler", () => {
  let handler: IsExternalKycListQueryHandler;
  let query: IsExternalKycListQuery;

  const securityServiceMock = createMock<SecurityService>();
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalKycListEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new IsExternalKycListQueryHandler(securityServiceMock, contractServiceMock, queryAdapterServiceMock);
    query = IsExternalKycListQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully validate if is external kyc list", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress
        .mockResolvedValueOnce(evmAddress)
        .mockResolvedValueOnce(externalKycListEvmAddress);

      queryAdapterServiceMock.isExternalKycList.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsExternalKycListQueryResponse);
      expect(result.payload).toBe(true);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.isExternalKycList).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(2, query.externalKycListAddress);

      expect(queryAdapterServiceMock.isExternalKycList).toHaveBeenCalledWith(evmAddress, externalKycListEvmAddress);
    });
  });
});
