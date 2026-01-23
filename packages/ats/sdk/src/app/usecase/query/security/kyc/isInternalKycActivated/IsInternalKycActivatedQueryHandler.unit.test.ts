// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import SecurityService from "@service/security/SecurityService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { IsInternalKycActivatedQuery, IsInternalKycActivatedQueryResponse } from "./IsInternalKycActivatedQuery";
import { IsInternalKycActivatedQueryHandler } from "./IsInternalKycActivatedQueryHandler";
import { IsInternalKycActivatedQueryFixture } from "@test/fixtures/kyc/KycFixture";

describe("IsInternalKycActivatedQueryHandler", () => {
  let handler: IsInternalKycActivatedQueryHandler;
  let query: IsInternalKycActivatedQuery;

  const securityServiceMock = createMock<SecurityService>();
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());

  beforeEach(() => {
    handler = new IsInternalKycActivatedQueryHandler(securityServiceMock, contractServiceMock, queryAdapterServiceMock);
    query = IsInternalKycActivatedQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully check if internal kyc is activated", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);

      queryAdapterServiceMock.isInternalKycActivated.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsInternalKycActivatedQueryResponse);
      expect(result.payload).toBe(true);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(securityServiceMock.get).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.isInternalKycActivated).toHaveBeenCalledTimes(1);

      expect(securityServiceMock.get).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);

      expect(queryAdapterServiceMock.isInternalKycActivated).toHaveBeenCalledWith(evmAddress);
    });
  });
});
