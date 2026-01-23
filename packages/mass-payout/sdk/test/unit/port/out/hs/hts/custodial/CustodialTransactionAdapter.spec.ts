// SPDX-License-Identifier: Apache-2.0

// CustodialTransactionAdapter.spec.ts
import { CustodialTransactionAdapter } from "@port/out/hs/hts/custodial/CustodialTransactionAdapter"
import {
  WalletEvents,
} from "@app/services/event/WalletEvent"
import { SupportedWallets } from "@domain/network/Wallet"
import { TransactionType } from "@port/out/TransactionResponseEnums"
import { HTSTransactionResponseAdapter } from "@port/out/hs/hts/HTSTransactionResponseAdapter"
import { PublickKeyNotFound } from "@port/out/hs/hts/custodial/error/PublickKeyNotFound"
import { SigningError } from "@port/out/error/SigningError"
import Account from "@domain/account/Account"
import TransactionResponse from "@domain/transaction/TransactionResponse"
import { Client, Transaction, TransactionReceipt } from "@hiero-ledger/sdk"
import { CustodialWalletService } from "@hashgraph/hedera-custodians-integration"
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings"

jest.mock("@hiero-ledger/sdk", () => ({
  Client: {
    forTestnet: jest.fn(() => ({ setOperatorWith: jest.fn() })),
    forMainnet: jest.fn(() => ({ setOperatorWith: jest.fn() })),
    forPreviewnet: jest.fn(() => ({ setOperatorWith: jest.fn() })),
  },
  Transaction: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
  TransactionAdapter: jest.fn().mockImplementation(() => ({
    stop: jest.fn(),
  })),
}))

jest.mock("@port/out/TransactionAdapter")

// mock adapters/helpers
const mockEventService = { emit: jest.fn() }
const mockMirrorNodeAdapter = { getAccountInfo: jest.fn() }
const mockNetworkService = { environment: "testnet" }

class TestCustodialAdapter extends CustodialTransactionAdapter {
  initCustodialWalletService = jest.fn()
  getSupportedWallet = jest.fn(() => SupportedWallets.DFNS)
}

describe("CustodialTransactionAdapter", () => {
  let service: TestCustodialAdapter

  beforeEach(() => {
    jest.clearAllMocks()
    service = new TestCustodialAdapter(
      mockEventService as any,
      mockMirrorNodeAdapter as any,
      mockNetworkService as any
    )
    service["custodialWalletService"] = {
      signTransaction: jest.fn().mockResolvedValue(new Uint8Array([1, 2])),
    } as unknown as CustodialWalletService
  })

  describe("register", () => {
    it("should throw if public key not found", async () => {
      mockMirrorNodeAdapter.getAccountInfo.mockResolvedValueOnce({})
      const settings = { hederaAccountId: "0.0.123" } as DfnsSettings

      await expect(service.register(settings)).rejects.toThrow(
        PublickKeyNotFound
      )
    })

    it("should register and emit walletPaired", async () => {
      mockMirrorNodeAdapter.getAccountInfo.mockResolvedValueOnce({
        publicKey: { key: "fakePublicKey" },
        evmAddress: "0xFakeEvmAddress",
      })

      const settings = { hederaAccountId: "0.0.123" } as DfnsSettings
      const result = await service.register(settings)

      expect(result.account).toBeInstanceOf(Account)
      expect(mockEventService.emit).toHaveBeenCalledWith(
        WalletEvents.walletPaired,
        expect.objectContaining({
          wallet: SupportedWallets.DFNS,
        })
      )
    })
  })

  describe("sign", () => {
    it("should throw if custodialWalletService is missing", async () => {
      service["custodialWalletService"] = undefined as any
      await expect(service.sign("abcd")).rejects.toThrow(SigningError)
    })

    it("should sign message and return hex string", async () => {
      const hex = await service.sign("abcd")
      expect(hex).toBe("0102")
    })
  })

  describe("signAndSendTransaction", () => {
    it("should execute transaction and return response", async () => {
      const tx = new Transaction();
      (tx.execute as jest.Mock).mockResolvedValueOnce({
        transactionId: { toString: () => "txId" },
      })

      const mockResponse: TransactionReceipt = {
        status: 22,
      } as unknown as TransactionReceipt
      const mockTxResponse = new TransactionResponse("txId", new Uint8Array())
      jest
        .spyOn(HTSTransactionResponseAdapter, "getReceipt")
        .mockResolvedValue(mockResponse)
      jest
        .spyOn(HTSTransactionResponseAdapter, "manageResponse")
        .mockResolvedValue(mockTxResponse)

      const result = await service.signAndSendTransaction(
        tx as any,
        TransactionType.RECEIPT
      )

      expect(result).toEqual(mockTxResponse)
    })

    it("should wrap error into SigningError", async () => {
      const tx = new Transaction();
      (tx.execute as jest.Mock).mockRejectedValueOnce(new Error("fail"))

      await expect(
        service.signAndSendTransaction(tx as any, "TRANSFER" as any)
      ).rejects.toThrow(SigningError)
    })
  })

  describe("signAndSendTransactionForDeployment", () => {
    it("should return transaction receipt", async () => {
      const tx = new Transaction()
      const mockReceipt: TransactionReceipt = {} as any;
      (tx.execute as jest.Mock).mockResolvedValueOnce({})

      jest
        .spyOn(HTSTransactionResponseAdapter, "getReceipt")
        .mockResolvedValue(mockReceipt)

      const result = await service.signAndSendTransactionForDeployment(
        tx as any
      )
      expect(result).toBe(mockReceipt)
    })

    it("should wrap error into SigningError", async () => {
      const tx = new Transaction();
      (tx.execute as jest.Mock).mockRejectedValueOnce(new Error("bad"))

      await expect(
        service.signAndSendTransactionForDeployment(tx as any)
      ).rejects.toThrow(SigningError)
    })
  })

  describe("initClient", () => {
    it("should initialize client for testnet", () => {
      service["initClient"]("0.0.123", "fakeKey")
      expect(Client.forTestnet).toHaveBeenCalled()
    })

    it("should throw for unsupported network", () => {
      const badNetwork = { environment: "invalid" }
      const s = new TestCustodialAdapter(
        mockEventService as any,
        mockMirrorNodeAdapter as any,
        badNetwork as any
      )
      expect(() => s["initClient"]("0.0.123", "key")).toThrow()
    })
  })
})
