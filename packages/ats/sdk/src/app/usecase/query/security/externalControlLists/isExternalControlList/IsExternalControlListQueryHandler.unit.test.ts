// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsExternalControlListQueryFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { IsExternalControlListQueryHandler } from "./IsExternalControlListQueryHandler";
import { IsExternalControlListQuery, IsExternalControlListQueryResponse } from "./IsExternalControlListQuery";

describe("IsExternalControlListQueryHandler", () => {
  let handler: IsExternalControlListQueryHandler;
  let query: IsExternalControlListQuery;

  const securityServiceMock = createMock<SecurityService>();
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalControlListEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new IsExternalControlListQueryHandler(securityServiceMock, contractServiceMock, queryAdapterServiceMock);
    query = IsExternalControlListQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully validate if is external control list", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress
        .mockResolvedValueOnce(evmAddress)
        .mockResolvedValueOnce(externalControlListEvmAddress);

      queryAdapterServiceMock.isExternalControlList.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsExternalControlListQueryResponse);
      expect(result.payload).toBe(true);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.isExternalControlList).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(2, query.externalControlListAddress);

      expect(queryAdapterServiceMock.isExternalControlList).toHaveBeenCalledWith(
        evmAddress,
        externalControlListEvmAddress,
      );
    });
  });
});
