// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsAuthorizedWhiteListMockQueryFixture } from "@test/fixtures/externalControlLists/ExternalControlListsFixture";
import { IsAuthorizedWhiteListMockQueryHandler } from "./IsAuthorizedWhiteListMockQueryHandler";
import {
  IsAuthorizedWhiteListMockQuery,
  IsAuthorizedWhiteListMockQueryResponse,
} from "./IsAuthorizedWhiteListMockQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";

describe("IsAuthorizedWhiteListMockQueryHandler", () => {
  let handler: IsAuthorizedWhiteListMockQueryHandler;
  let query: IsAuthorizedWhiteListMockQuery;

  const rpcQueryAdapterMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const contractEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  beforeEach(() => {
    handler = new IsAuthorizedWhiteListMockQueryHandler(contractServiceMock, rpcQueryAdapterMock, accountServiceMock);
    query = IsAuthorizedWhiteListMockQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("should successfully verify if is authorized", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(contractEvmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      rpcQueryAdapterMock.isAuthorizedWhiteListMock.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsAuthorizedWhiteListMockQueryResponse);
      expect(result.payload).toBe(true);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(rpcQueryAdapterMock.isAuthorizedWhiteListMock).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.contractId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);

      expect(rpcQueryAdapterMock.isAuthorizedWhiteListMock).toHaveBeenCalledWith(contractEvmAddress, targetEvmAddress);
    });
  });
});
