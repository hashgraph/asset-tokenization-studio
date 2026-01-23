// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */
import { Test, TestingModule } from "@nestjs/testing"
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter"
import NetworkService from "@app/services/network/NetworkService"
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter"
import { ethers } from "ethers"
import { LifeCycleCashFlow__factory } from "@hashgraph/mass-payout-contracts"
import EvmAddress from "@domain/contract/EvmAddress"
import {
  EvmAddressPropsFixture,
} from "../../../../fixture/DataFixture"

const mockNetworkService = {
  environment: "testnet",
}

const mockMirrorNode = {}

const mockContract = {
  isPaused: jest.fn(),
  getPaymentToken: jest.fn(),
  getPaymentTokenDecimals: jest.fn(),
}

jest.mock("@hashgraph/mass-payout-contracts", () => ({
  LifeCycleCashFlow__factory: {
    connect: jest.fn(() => mockContract),
  },
}))

describe("RPCQueryAdapter", () => {
  let service: RPCQueryAdapter

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RPCQueryAdapter,
        { provide: NetworkService, useValue: mockNetworkService },
        { provide: MirrorNodeAdapter, useValue: mockMirrorNode },
      ],
    }).compile()

    service = module.get<RPCQueryAdapter>(RPCQueryAdapter)

    jest.spyOn(ethers.providers, "JsonRpcProvider").mockImplementation(() => {
      return {} as any
    })

    jest.clearAllMocks()
  })

  describe("init", () => {
    it("should initialize provider with default URL", async () => {
      const env = await service.init()
      expect(env).toBe("testnet")
      expect(ethers.providers.JsonRpcProvider).toHaveBeenCalledWith(
        "http://127.0.0.1:7546/api"
      )
    })

    it("should initialize provider with custom URL + apiKey", async () => {
      await service.init("http://custom.url/", "apikey123")
      expect(ethers.providers.JsonRpcProvider).toHaveBeenCalledWith(
        "http://custom.url/apikey123"
      )
    })
  })

  describe("connect", () => {
    it("should call factory connect with provider", () => {
      const lifeCycleCashFlowEvmAddress = EvmAddressPropsFixture.create().value
      service.init()
      const result = service.connect(
        LifeCycleCashFlow__factory,
        lifeCycleCashFlowEvmAddress
      )
      expect(LifeCycleCashFlow__factory.connect).toHaveBeenCalledWith(
        lifeCycleCashFlowEvmAddress,
        expect.any(Object) // provider
      )
      expect(result).toBe(mockContract)
    })
  })

  describe("isPaused", () => {
    it("should return isPaused from contract", async () => {
      mockContract.isPaused.mockResolvedValueOnce(true)
      const result = await service.isPaused(
        new EvmAddress(EvmAddressPropsFixture.create().value)
      )
      expect(mockContract.isPaused).toHaveBeenCalled()
      expect(result).toBe(true)
    })
  })

  describe("getPaymentToken", () => {
    it("should return payment token", async () => {
      mockContract.getPaymentToken.mockResolvedValueOnce("0xToken")
      const result = await service.getPaymentToken(
        new EvmAddress(EvmAddressPropsFixture.create().value)
      )
      expect(mockContract.getPaymentToken).toHaveBeenCalled()
      expect(result).toBe("0xToken")
    })
  })

  describe("getPaymentTokenDecimals", () => {
    it("should return payment token decimals", async () => {
      mockContract.getPaymentTokenDecimals.mockResolvedValueOnce(18)
      const result = await service.getPaymentTokenDecimals(
        new EvmAddress(EvmAddressPropsFixture.create().value)
      )
      expect(mockContract.getPaymentTokenDecimals).toHaveBeenCalled()
      expect(result).toBe(18)
    })
  })
})
