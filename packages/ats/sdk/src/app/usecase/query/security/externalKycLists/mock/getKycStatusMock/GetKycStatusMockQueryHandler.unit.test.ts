// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetKycStatusMockQueryHandler } from "./GetKycStatusMockQueryHandler";
import { GetKycStatusMockQuery, GetKycStatusMockQueryResponse } from "./GetKycStatusMockQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import { GetKycStatusMockQueryFixture } from "@test/fixtures/externalKycLists/ExternalKycListsFixture";

describe("GetKycStatusMockQueryHandler", () => {
  let handler: GetKycStatusMockQueryHandler;
  let query: GetKycStatusMockQuery;

  const rpcQueryAdapterMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  beforeEach(() => {
    handler = new GetKycStatusMockQueryHandler(contractServiceMock, rpcQueryAdapterMock, accountServiceMock);
    query = GetKycStatusMockQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully get kyc status mock", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      rpcQueryAdapterMock.getKycStatusMock.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetKycStatusMockQueryResponse);
      expect(result.payload).toBe(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(rpcQueryAdapterMock.getKycStatusMock).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.contractId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);

      expect(rpcQueryAdapterMock.getKycStatusMock).toHaveBeenCalledWith(contractEvmAddress, targetEvmAddress);
    });
  });
});
