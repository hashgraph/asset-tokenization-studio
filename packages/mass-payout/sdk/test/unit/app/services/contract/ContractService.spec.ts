// SPDX-License-Identifier: Apache-2.0

import ContractService from "@app/services/contract/ContractService";
import NetworkService from "@app/services/network/NetworkService";
import TransactionService from "@app/services/transaction/TransactionService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import EvmAddress from "@domain/contract/EvmAddress";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../fixture/DataFixture";

const mockNetworkService = {} as unknown as NetworkService;
const mockTransactionService = {} as unknown as TransactionService;
const mockMirrorNodeAdapter = {
  getContractInfo: jest.fn(),
} as unknown as MirrorNodeAdapter;

describe("ContractService", () => {
  let contractService: ContractService;

  beforeEach(() => {
    jest.clearAllMocks();
    contractService = new ContractService(mockNetworkService, mockTransactionService, mockMirrorNodeAdapter);
  });

  describe("getContractEvmAddress", () => {
    it("should return evmAddress from mirror node when given a Hedera ID", async () => {
      const contractId = HederaIdPropsFixture.create().value;
      const fakeEvmAddress = EvmAddressPropsFixture.create().value;

      (mockMirrorNodeAdapter.getContractInfo as jest.Mock).mockResolvedValue({
        evmAddress: fakeEvmAddress,
      });

      const result = await contractService.getContractEvmAddress(contractId);

      expect(mockMirrorNodeAdapter.getContractInfo).toHaveBeenCalledWith(contractId);
      expect(result).toBeInstanceOf(EvmAddress);
      expect(result.toString()).toEqual(fakeEvmAddress);
    });

    it("should return the evmAddress directly if input is already an EVM address", async () => {
      const evmAddress = EvmAddressPropsFixture.create().value;

      const result = await contractService.getContractEvmAddress(evmAddress);

      expect(mockMirrorNodeAdapter.getContractInfo).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(EvmAddress);
      expect(result.toString()).toEqual(evmAddress);
    });
  });

  describe("getEvmAddressesFromHederaIds", () => {
    it("should return an empty array if no addresses are provided", async () => {
      const result = await contractService.getEvmAddressesFromHederaIds();
      expect(result).toEqual([]);
    });

    it("should resolve multiple Hedera IDs into EvmAddress[]", async () => {
      const hederaIds = [HederaIdPropsFixture.create().value, HederaIdPropsFixture.create().value];
      const evmAddresses = [EvmAddressPropsFixture.create().value, EvmAddressPropsFixture.create().value];

      (mockMirrorNodeAdapter.getContractInfo as jest.Mock)
        .mockResolvedValueOnce({ evmAddress: evmAddresses[0] })
        .mockResolvedValueOnce({ evmAddress: evmAddresses[1] });

      const result = await contractService.getEvmAddressesFromHederaIds(hederaIds);

      expect(mockMirrorNodeAdapter.getContractInfo).toHaveBeenCalledTimes(2);
      expect(result.map((r) => r.toString())).toEqual(evmAddresses);
    });
  });
});
