// SPDX-License-Identifier: Apache-2.0

import ContractService from "./ContractService"; // Adjust path as needed
import NetworkService from "@service/network/NetworkService";
import TransactionService from "@service/transaction/TransactionService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { createMock } from "@golevelup/ts-jest";
import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "@test/fixtures/shared/DataFixture";
import { InvalidEvmAddress } from "@domain/context/contract/error/InvalidEvmAddress";

describe("ContractService", () => {
  let service: ContractService;

  const queryBusMock = createMock<QueryBus>();
  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();
  const transactionServiceMock = createMock<TransactionService>();
  const networkServiceMock = createMock<NetworkService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value).toString();
  const evmAddress2 = new EvmAddress(EvmAddressPropsFixture.create().value).toString();
  const id = HederaIdPropsFixture.create().value;
  const id2 = HederaIdPropsFixture.create().value;

  beforeEach(() => {
    service = new ContractService(networkServiceMock, transactionServiceMock, mirrorNodeAdapterMock);
    jest.spyOn(Injectable, "resolve").mockReturnValue(queryBusMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getContractEvmAddress", () => {
    it("should return EvmAddress for a valid Hedera contract ID", async () => {
      mirrorNodeAdapterMock.getContractInfo.mockResolvedValue({
        id,
        evmAddress,
      });

      const result = await service.getContractEvmAddress(id);

      expect(mirrorNodeAdapterMock.getContractInfo).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(EvmAddress);
      expect(result.value).toBe(evmAddress);
    });

    it("should return EvmAddress for a valid EVM address", async () => {
      const result = await service.getContractEvmAddress(evmAddress);

      expect(mirrorNodeAdapterMock.getContractInfo).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(EvmAddress);
      expect(result.value).toBe(evmAddress);
    });

    it("should throw an error for an invalid contract ID format", async () => {
      const invalidContractId = "invalid-id";

      await expect(service.getContractEvmAddress(invalidContractId)).rejects.toBeInstanceOf(InvalidEvmAddress);
      expect(mirrorNodeAdapterMock.getContractInfo).not.toHaveBeenCalled();
    });
  });

  describe("getEvmAddressesFromHederaIds", () => {
    it("should return an empty array when addresses is undefined", async () => {
      const result = await service.getEvmAddressesFromHederaIds(undefined);

      expect(result).toEqual([]);
      expect(mirrorNodeAdapterMock.getContractInfo).not.toHaveBeenCalled();
    });

    it("should return EvmAddress array for a list of valid contract IDs", async () => {
      const contractIds = [id, id2];
      const evmAddresses = [evmAddress, evmAddress2];
      mirrorNodeAdapterMock.getContractInfo
        .mockResolvedValueOnce({
          id: contractIds[0],
          evmAddress: evmAddresses[0],
        })
        .mockResolvedValueOnce({
          id: contractIds[1],
          evmAddress: evmAddresses[1],
        });

      const result = await service.getEvmAddressesFromHederaIds(contractIds);

      expect(mirrorNodeAdapterMock.getContractInfo).toHaveBeenCalledTimes(2);
      expect(mirrorNodeAdapterMock.getContractInfo).toHaveBeenCalledWith(contractIds[0]);
      expect(mirrorNodeAdapterMock.getContractInfo).toHaveBeenCalledWith(contractIds[1]);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(EvmAddress);
      expect(result[0].value).toBe(evmAddresses[0]);
      expect(result[1]).toBeInstanceOf(EvmAddress);
      expect(result[1].value).toBe(evmAddresses[1]);
    });

    it("should handle mixed input of Hedera IDs and EVM addresses", async () => {
      const addresses = [id, evmAddress];
      mirrorNodeAdapterMock.getContractInfo.mockResolvedValueOnce({
        id,
        evmAddress,
      });

      const result = await service.getEvmAddressesFromHederaIds(addresses);

      expect(mirrorNodeAdapterMock.getContractInfo).toHaveBeenCalledTimes(1);
      expect(mirrorNodeAdapterMock.getContractInfo).toHaveBeenCalledWith(addresses[0]);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(EvmAddress);
      expect(result[0].value).toBe(evmAddress);
      expect(result[1]).toBeInstanceOf(EvmAddress);
      expect(result[1].value).toBe(addresses[1]);
    });

    it("should handle empty address array", async () => {
      const result = await service.getEvmAddressesFromHederaIds([]);

      expect(result).toEqual([]);
      expect(mirrorNodeAdapterMock.getContractInfo).not.toHaveBeenCalled();
    });
  });
});
