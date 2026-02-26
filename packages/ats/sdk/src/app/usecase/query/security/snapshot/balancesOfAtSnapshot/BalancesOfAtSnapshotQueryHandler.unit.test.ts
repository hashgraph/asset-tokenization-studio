// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { EvmAddressPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { BalancesOfAtSnapshotQueryError } from "./error/BalancesOfAtSnapshotQueryError";
import { BalancesOfAtSnapshotQuery, BalancesOfAtSnapshotQueryResponse } from "./BalancesOfAtSnapshotQuery";
import { BalancesOfAtSnapshotQueryHandler } from "./BalancesOfAtSnapshotQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";

describe("BalancesOfAtSnapshotQueryHandler", () => {
  let handler: BalancesOfAtSnapshotQueryHandler;
  let query: BalancesOfAtSnapshotQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const mockBalances = [
    { holder: "0x1234567890123456789012345678901234567890", balance: BigInt(1000) },
    { holder: "0x0987654321098765432109876543210987654321", balance: BigInt(2000) },
  ];

  beforeEach(() => {
    handler = new BalancesOfAtSnapshotQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = new BalancesOfAtSnapshotQuery("securityId", 1, 0, 10);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws BalancesOfAtSnapshotQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toThrow(BalancesOfAtSnapshotQueryError);
    });

    it("throws BalancesOfAtSnapshotQueryError when RPC query fails", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
      queryAdapterServiceMock.balancesOfAtSnapshot.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toThrow(BalancesOfAtSnapshotQueryError);
    });

    it("returns balances when query succeeds", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
      queryAdapterServiceMock.balancesOfAtSnapshot.mockResolvedValue(mockBalances);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(BalancesOfAtSnapshotQueryResponse);
      expect(result.payload).toEqual(mockBalances);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith("securityId");
      expect(queryAdapterServiceMock.balancesOfAtSnapshot).toHaveBeenCalledWith(evmAddress, 1, 0, 10);
    });

    it("returns empty array when no balances found", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValue(evmAddress);
      queryAdapterServiceMock.balancesOfAtSnapshot.mockResolvedValue([]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(BalancesOfAtSnapshotQueryResponse);
      expect(result.payload).toEqual([]);
    });
  });
});
