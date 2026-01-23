// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsAuthorizedBlackListMockQueryFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import { IsAuthorizedBlackListMockQueryHandler } from "./IsAuthorizedBlackListMockQueryHandler";
import {
  IsAuthorizedBlackListMockQuery,
  IsAuthorizedBlackListMockQueryResponse,
} from "./IsAuthorizedBlackListMockQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";

describe("IsAuthorizedBlackListMockQueryHandler", () => {
  let handler: IsAuthorizedBlackListMockQueryHandler;
  let query: IsAuthorizedBlackListMockQuery;

  const rpcQueryAdapterMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  beforeEach(() => {
    handler = new IsAuthorizedBlackListMockQueryHandler(contractServiceMock, rpcQueryAdapterMock, accountServiceMock);
    query = IsAuthorizedBlackListMockQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully verify if is authorized", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      rpcQueryAdapterMock.isAuthorizedBlackListMock.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsAuthorizedBlackListMockQueryResponse);
      expect(result.payload).toBe(true);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(rpcQueryAdapterMock.isAuthorizedBlackListMock).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.contractId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);

      expect(rpcQueryAdapterMock.isAuthorizedBlackListMock).toHaveBeenCalledWith(contractEvmAddress, targetEvmAddress);
    });
  });
});
