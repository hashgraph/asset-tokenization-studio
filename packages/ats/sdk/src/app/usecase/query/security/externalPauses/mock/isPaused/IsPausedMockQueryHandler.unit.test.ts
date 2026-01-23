// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { IsPausedMockQueryHandler } from "./IsPausedMockQueryHandler";
import { IsPausedMockQuery, IsPausedMockQueryResponse } from "./IsPausedMockQuery";
import { IsPausedMockQueryFixture } from "@test/fixtures/externalPauses/ExternalPausesFixture";

describe("IsPausedMockQueryHandler", () => {
  let handler: IsPausedMockQueryHandler;
  let query: IsPausedMockQuery;

  const rpcQueryAdapterMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  beforeEach(() => {
    handler = new IsPausedMockQueryHandler(contractServiceMock, rpcQueryAdapterMock);
    query = IsPausedMockQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully verify if is pause", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);
      rpcQueryAdapterMock.isPausedMock.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsPausedMockQueryResponse);
      expect(result.payload).toBe(true);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(rpcQueryAdapterMock.isPausedMock).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.contractId);
      expect(rpcQueryAdapterMock.isPausedMock).toHaveBeenCalledWith(contractEvmAddress);
    });
  });
});
