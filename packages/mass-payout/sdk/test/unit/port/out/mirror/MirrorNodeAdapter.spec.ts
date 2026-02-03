// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */
import axios from "axios";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { InvalidResponse } from "@core/error/InvalidResponse";
import { ErrorRetrievingEvmAddress } from "@port/out/mirror/error/ErrorRetrievingEvmAddress";
import EvmAddress from "@domain/contract/EvmAddress";
import { KeyType } from "@domain/account/KeyProps";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../fixture/DataFixture";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("MirrorNodeAdapter", () => {
  let adapter: MirrorNodeAdapter;

  beforeEach(() => {
    (axios.create as jest.Mock).mockReturnValue(axios);
    adapter = new MirrorNodeAdapter();
    adapter.set({
      baseUrl: "http://localhost:5551",
      headerName: "x-api-key",
      apiKey: "test-key",
    } as any);
  });

  describe("getAccountInfo", () => {
    it("should return account info with evmAddress and alias", async () => {
      const accountId = HederaIdPropsFixture.create().value;
      const accountEvmAddress = EvmAddressPropsFixture.create().value;
      mockedAxios.create.mockReturnValueOnce(mockedAxios as any);
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          account: accountId,
          evm_address: accountEvmAddress,
          alias: "alias",
          key: { _type: "ECDSA_SECP256K1", key: "002233" },
        },
      });

      const result = await adapter.getAccountInfo(accountId);

      expect(result.id.toString()).toBe(accountId);
      expect(result.evmAddress).toBe(accountEvmAddress);
      expect(result.alias).toBe("alias");
      expect(result.publicKey?.type).toBe(KeyType.ECDSA);
      expect(result.publicKey?.key).toBe("2233"); // leading zeros trimmed
    });

    it("should throw InvalidResponse on error", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("network down"));

      await expect(adapter.getAccountInfo(HederaIdPropsFixture.create().value)).rejects.toBeInstanceOf(InvalidResponse);
    });
  });

  describe("getContractInfo", () => {
    it("should return contract view model", async () => {
      const contractId = HederaIdPropsFixture.create().value;
      const contractEvmAddress = EvmAddressPropsFixture.create().value;
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { contract_id: contractId, evm_address: contractEvmAddress },
      });

      const result = await adapter.getContractInfo(contractEvmAddress);
      expect(result.id).toBe(contractId);
      expect(result.evmAddress).toBe(contractEvmAddress);
    });

    it("should reject with InvalidResponse on error", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Error getting contract info"));

      await expect(adapter.getContractInfo(EvmAddressPropsFixture.create().value)).rejects.toBeInstanceOf(
        InvalidResponse,
      );
    });
  });

  describe("getTransactionResult", () => {
    it("should return transaction result", async () => {
      const txEvmAddress = EvmAddressPropsFixture.create().value;
      mockedAxios.get.mockResolvedValueOnce({
        data: { call_result: txEvmAddress },
      });

      const result = await adapter.getTransactionResult(HederaIdPropsFixture.create().value);
      expect(result.result).toBe(txEvmAddress);
    });

    it("should throw InvalidResponse when no call_result", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      await expect(adapter.getTransactionResult(HederaIdPropsFixture.create().value)).rejects.toBeInstanceOf(
        InvalidResponse,
      );
    });
  });

  describe("getTransactionFinalError", () => {
    it("should return last child transaction result", async () => {
      const txId = HederaIdPropsFixture.create().value;
      mockedAxios.get.mockResolvedValueOnce({
        data: { transactions: [{ result: "SUCCESS" }, { result: "FAILURE" }] },
      });

      const result = await adapter.getTransactionFinalError(txId);
      expect(result.result).toBe("FAILURE");
    }, 10000);

    it("should throw TransactionNotFound if no transactions exist", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      await expect(adapter.getTransactionFinalError(HederaIdPropsFixture.create().value)).rejects.toBeInstanceOf(
        InvalidResponse,
      );
    }, 10000);
  });

  describe("accountToEvmAddress", () => {
    it("should return evmAddress directly when present", async () => {
      const accountToEvmAddress = EvmAddressPropsFixture.create().value;
      jest.spyOn(adapter, "getAccountInfo").mockResolvedValueOnce({
        id: { shard: 0, realm: 0, num: 123 } as any,
        evmAddress: accountToEvmAddress,
      });

      const result = await adapter.accountToEvmAddress("0.0.123");
      expect(result).toBeInstanceOf(EvmAddress);
      expect(result.toString()).toBe(accountToEvmAddress);
    });

    it("should throw ErrorRetrievingEvmAddress on error", async () => {
      jest.spyOn(adapter, "getAccountInfo").mockRejectedValueOnce(new Error("fail"));

      await expect(adapter.accountToEvmAddress(HederaIdPropsFixture.create().value)).rejects.toBeInstanceOf(
        ErrorRetrievingEvmAddress,
      );
    });
  });

  describe("getHederaIdfromContractAddress", () => {
    it("should return id when contract address length >= 40", async () => {
      const contractId = HederaIdPropsFixture.create().value;
      const contractEvmAddress = EvmAddressPropsFixture.create().value;
      jest.spyOn(adapter, "getContractInfo").mockResolvedValueOnce({
        id: contractId,
        evmAddress: contractEvmAddress,
      });

      const result = await adapter.getHederaIdfromContractAddress("0x".padEnd(42, "1"));
      expect(result).toBe(contractId);
    });

    it("should return input if length < 40", async () => {
      const result = await adapter.getHederaIdfromContractAddress("short");
      expect(result).toBe("short");
    });
  });
});
