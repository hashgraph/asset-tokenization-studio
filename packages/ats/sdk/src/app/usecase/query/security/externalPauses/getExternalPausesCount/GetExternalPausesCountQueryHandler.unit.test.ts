// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { GetExternalPausesCountQuery, GetExternalPausesCountQueryResponse } from "./GetExternalPausesCountQuery";
import { GetExternalPausesCountQueryHandler } from "./GetExternalPausesCountQueryHandler";
import { GetExternalPausesCountQueryFixture } from "@test/fixtures/externalPauses/ExternalPausesFixture";

describe("GetExternalPausesCountQueryHandler", () => {
  let handler: GetExternalPausesCountQueryHandler;
  let query: GetExternalPausesCountQuery;

  const securityServiceMock = createMock<SecurityService>();
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new GetExternalPausesCountQueryHandler(securityServiceMock, contractServiceMock, queryAdapterServiceMock);
    query = GetExternalPausesCountQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully get external pauses count", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);

      queryAdapterServiceMock.getExternalPausesCount.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetExternalPausesCountQueryResponse);
      expect(result.payload).toBe(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getExternalPausesCount).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);

      expect(queryAdapterServiceMock.getExternalPausesCount).toHaveBeenCalledWith(evmAddress);
    });
  });
});
