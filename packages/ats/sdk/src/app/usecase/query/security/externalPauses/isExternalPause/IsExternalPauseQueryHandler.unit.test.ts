// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { IsExternalPauseQueryHandler } from "./IsExternalPauseQueryHandler";
import { IsExternalPauseQuery, IsExternalPauseQueryResponse } from "./IsExternalPauseQuery";
import { IsExternalPauseQueryFixture } from "@test/fixtures/externalPauses/ExternalPausesFixture";

describe("IsExternalPauseQueryHandler", () => {
  let handler: IsExternalPauseQueryHandler;
  let query: IsExternalPauseQuery;

  const securityServiceMock = createMock<SecurityService>();
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const externalPauseEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new IsExternalPauseQueryHandler(securityServiceMock, contractServiceMock, queryAdapterServiceMock);
    query = IsExternalPauseQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully validate if is external pause", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress
        .mockResolvedValueOnce(evmAddress)
        .mockResolvedValueOnce(externalPauseEvmAddress);

      queryAdapterServiceMock.isExternalPause.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsExternalPauseQueryResponse);
      expect(result.payload).toBe(true);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.isExternalPause).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(1, query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenNthCalledWith(2, query.externalPauseAddress);

      expect(queryAdapterServiceMock.isExternalPause).toHaveBeenCalledWith(evmAddress, externalPauseEvmAddress);
    });
  });
});
