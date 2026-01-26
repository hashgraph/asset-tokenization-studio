// SPDX-License-Identifier: Apache-2.0

import { ContractId, TransactionReceipt } from "@hiero-ledger/sdk"
import TransactionResponse from "@domain/transaction/TransactionResponse"
import EvmAddress from "@domain/contract/EvmAddress"
import BigDecimal from "@domain/shared/BigDecimal"
import Account from "@domain/account/Account"

import { HederaTransactionAdapter } from "@port/out/hs/HederaTransactionAdapter"
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter"
import NetworkService from "@app/services/network/NetworkService"
import {
  EvmAddressPropsFixture,
  HederaIdPropsFixture,
} from "../../../../fixture/DataFixture"

// ✅ Create a concrete test class
class TestHederaTransactionAdapter extends HederaTransactionAdapter {
  public mockSignAndSendTransaction = jest.fn()
  public mockSignAndSendTransactionForDeployment = jest.fn()
  public mockGetAccount = jest.fn()

  async signAndSendTransaction(): Promise<TransactionResponse> {
    return this.mockSignAndSendTransaction()
  }

  async signAndSendTransactionForDeployment(): Promise<TransactionReceipt> {
    return this.mockSignAndSendTransactionForDeployment()
  }

  getAccount(): Account {
    return this.mockGetAccount()
  }
}

describe("HederaTransactionAdapter", () => {
  let adapter: TestHederaTransactionAdapter
  let mirrorNodeAdapter: jest.Mocked<MirrorNodeAdapter>
  let networkService: jest.Mocked<NetworkService>

  beforeEach(() => {
    jest.clearAllMocks()

    // mock dependencies
    mirrorNodeAdapter = {
      getContractInfo: jest.fn(),
    } as any

    networkService = {} as any

    adapter = new TestHederaTransactionAdapter(
      mirrorNodeAdapter,
      networkService
    )
  })

  describe("setMirrorNodes", () => {
    it("should set mirrorNodes when provided", () => {
      const mockMirrorNodes = { main: "node1" } as any
      adapter.setMirrorNodes(mockMirrorNodes)
      expect(adapter.mirrorNodes).toBe(mockMirrorNodes)
    })
  })

  describe("setJsonRpcRelays", () => {
    it("should set jsonRpcRelays when provided", () => {
      const mockRelays = { relay: "http://rpc.test" } as any
      adapter.setJsonRpcRelays(mockRelays)
      expect(adapter.jsonRpcRelays).toBe(mockRelays)
    })
  })

  describe("deploy", () => {
    it("should deploy lifecycle without rbac, proxy admin, proxy and return proxy address", async () => {
      const asset = new EvmAddress(EvmAddressPropsFixture.create().value)
      const paymentToken = new EvmAddress(EvmAddressPropsFixture.create().value)

      // --- mocks ---
      const lifecycleContractId = ContractId.fromString("0.0.1001")
      const proxyAdminContractId = ContractId.fromString("0.0.1002")
      const proxyContractId = ContractId.fromString("0.0.1003")

      jest
        .spyOn(adapter as any, "deployLifeCycleCashFlow")
        .mockResolvedValue(lifecycleContractId)

      mirrorNodeAdapter.getContractInfo.mockResolvedValue({
        evmAddress: "0x1111111111111111111111111111111111111111",
      } as any)

      adapter.mockGetAccount.mockReturnValue({
        evmAddress: "0x2222222222222222222222222222222222222222",
      } as any)

      adapter.mockSignAndSendTransactionForDeployment
        .mockResolvedValueOnce({
          contractId: proxyAdminContractId,
        } as any)
        .mockResolvedValueOnce({
          contractId: proxyContractId,
        } as any)

      // --- execute ---
      const result = await adapter.deploy(asset, paymentToken, [])

      // --- assertions ---
      expect(mirrorNodeAdapter.getContractInfo).toHaveBeenCalledWith(
        lifecycleContractId.toString()
      )

      expect(adapter.mockSignAndSendTransactionForDeployment).toHaveBeenCalledTimes(
        2
      )

      expect(result).toBe(
        "0x" + proxyContractId.toSolidityAddress()
      )
    })

    it("should deploy lifecycle with rbac, proxy admin, proxy and return proxy address", async () => {
      const asset = new EvmAddress(EvmAddressPropsFixture.create().value)
      const paymentToken = new EvmAddress(EvmAddressPropsFixture.create().value)
      const rbac = [
        {
          role: "0x0000000000000000000000000000000000000000000000000000000000000001",
          members: [
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
          ]
        }
      ];

      // --- mocks ---
      const lifecycleContractId = ContractId.fromString("0.0.1001")
      const proxyAdminContractId = ContractId.fromString("0.0.1002")
      const proxyContractId = ContractId.fromString("0.0.1003")

      jest
        .spyOn(adapter as any, "deployLifeCycleCashFlow")
        .mockResolvedValue(lifecycleContractId)

      mirrorNodeAdapter.getContractInfo.mockResolvedValue({
        evmAddress: "0x1111111111111111111111111111111111111111",
      } as any)

      adapter.mockGetAccount.mockReturnValue({
        evmAddress: "0x2222222222222222222222222222222222222222",
      } as any)

      adapter.mockSignAndSendTransactionForDeployment
        .mockResolvedValueOnce({
          contractId: proxyAdminContractId,
        } as any)
        .mockResolvedValueOnce({
          contractId: proxyContractId,
        } as any)

      // --- execute ---
      const result = await adapter.deploy(asset, paymentToken, rbac)

      // --- assertions ---
      expect(mirrorNodeAdapter.getContractInfo).toHaveBeenCalledWith(
        lifecycleContractId.toString()
      )

      expect(adapter.mockSignAndSendTransactionForDeployment).toHaveBeenCalledTimes(
        2
      )

      expect(result).toBe(
        "0x" + proxyContractId.toSolidityAddress()
      )
    })
  })

  describe("pause", () => {
    it("should call signAndSendTransaction with encoded function data", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const contractId = ContractId.fromString(
        HederaIdPropsFixture.create().value
      )

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock",
      } as any)

      const result = await adapter.pause(lifeCycleCashFlow, contractId)

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock" })
    })
  })

  describe("unpause", () => {
    it("should call signAndSendTransaction with encoded function data", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const contractId = ContractId.fromString(
        HederaIdPropsFixture.create().value
      )

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock-unpause",
      } as any)

      const result = await adapter.unpause(lifeCycleCashFlow, contractId)

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock-unpause" })
    })
  })

  describe("executeDistribution", () => {
    it("should encode args and call signAndSendTransaction", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const asset = new EvmAddress(EvmAddressPropsFixture.create().value)
      const distributionID = "1234567890"

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock-execute",
      } as any)

      const result = await adapter.executeDistribution(
        lifeCycleCashFlow,
        HederaIdPropsFixture.create().value,
        asset,
        distributionID,
        0,
        10
      )

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock-execute" })
    })
  })

  describe("executeDistributionByAddresses", () => {
    it("should encode args and call signAndSendTransaction", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const asset = new EvmAddress(EvmAddressPropsFixture.create().value)
      const distributionID = "1234567890"

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock-execute",
      } as any)

      const result = await adapter.executeDistributionByAddresses(
        lifeCycleCashFlow,
        HederaIdPropsFixture.create().value,
        asset,
        distributionID,
        [
          new EvmAddress(EvmAddressPropsFixture.create().value),
          new EvmAddress(EvmAddressPropsFixture.create().value),
        ]
      )

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock-execute" })
    })
  })

  describe("executeBondCashOut", () => {
    it("should encode args and call signAndSendTransaction", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const bond = new EvmAddress(EvmAddressPropsFixture.create().value)

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock-execute",
      } as any)

      const result = await adapter.executeBondCashOut(
        lifeCycleCashFlow,
        HederaIdPropsFixture.create().value,
        bond,
        0,
        10
      )

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock-execute" })
    })
  })

  describe("executeBondCashOutByAddresses", () => {
    it("should encode args and call signAndSendTransaction", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const bond = new EvmAddress(EvmAddressPropsFixture.create().value)

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock-execute",
      } as any)

      const result = await adapter.executeBondCashOutByAddresses(
        lifeCycleCashFlow,
        HederaIdPropsFixture.create().value,
        bond,
        [
          new EvmAddress(EvmAddressPropsFixture.create().value),
          new EvmAddress(EvmAddressPropsFixture.create().value),
        ]
      )

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock-execute" })
    })
  })

  describe("executeAmountSnapshot", () => {
    it("should encode args and call signAndSendTransaction", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const asset = new EvmAddress(EvmAddressPropsFixture.create().value)
      const snapshotID = "1234567890"

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock-execute",
      } as any)

      const result = await adapter.executeAmountSnapshot(
        lifeCycleCashFlow,
        HederaIdPropsFixture.create().value,
        asset,
        snapshotID,
        0,
        10,
        new BigDecimal("100")
      )

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock-execute" })
    })
  })

  describe("executeAmountSnapshotByAddresses", () => {
    it("should encode args and call signAndSendTransaction", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const asset = new EvmAddress(EvmAddressPropsFixture.create().value)
      const snapshotID = "1234567890"

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock-execute",
      } as any)

      const result = await adapter.executeAmountSnapshotByAddresses(
        lifeCycleCashFlow,
        HederaIdPropsFixture.create().value,
        asset,
        snapshotID,
        [
          new EvmAddress(EvmAddressPropsFixture.create().value),
          new EvmAddress(EvmAddressPropsFixture.create().value),
        ],
        new BigDecimal("100")
      )

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock-execute" })
    })
  })

  describe("executePercentageSnapshot", () => {
    it("should encode percentage and call signAndSendTransaction", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const asset = new EvmAddress(EvmAddressPropsFixture.create().value)
      const snapshotId = "1234567890"
      const percentage = new BigDecimal("20")

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock-snapshot",
      } as any)

      const result = await adapter.executePercentageSnapshot(
        lifeCycleCashFlow,
        HederaIdPropsFixture.create().value,
        asset,
        snapshotId,
        0,
        5,
        percentage
      )

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock-snapshot" })
    })
  })

  describe("executePercentageSnapshotByAddresses", () => {
    it("should encode percentage and call signAndSendTransaction", async () => {
      const lifeCycleCashFlow = new EvmAddress(
        EvmAddressPropsFixture.create().value
      )
      const asset = new EvmAddress(EvmAddressPropsFixture.create().value)
      const snapshotId = "1234567890"
      const percentage = new BigDecimal("20")

      adapter.mockSignAndSendTransaction.mockResolvedValueOnce({
        tx: "mock-snapshot",
      } as any)

      const result = await adapter.executePercentageSnapshotByAddresses(
        lifeCycleCashFlow,
        HederaIdPropsFixture.create().value,
        asset,
        snapshotId,
        [
          new EvmAddress(EvmAddressPropsFixture.create().value),
          new EvmAddress(EvmAddressPropsFixture.create().value),
        ],
        percentage
      )

      expect(adapter.mockSignAndSendTransaction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ tx: "mock-snapshot" })
    })
  })
})
