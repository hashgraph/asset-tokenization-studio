// SPDX-License-Identifier: Apache-2.0

import "reflect-metadata";
import { HederaWalletConnectTransactionAdapter } from "./HederaWalletConnectTransactionAdapter";
import { Transaction } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import EventService from "@service/event/EventService";
import NetworkService from "@service/network/NetworkService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { WalletEvents } from "@service/event/WalletEvent";
import { SupportedWallets } from "@domain/context/network/Wallet";
import { NotInitialized } from "./error/NotInitialized";
import { AccountNotSet } from "./error/AccountNotSet";
import { NoSettings } from "./error/NoSettings";
import { ConsensusNodesNotSet } from "./error/ConsensusNodesNotSet";
import { SigningError } from "@port/out/error/SigningError";
import Account from "@domain/context/account/Account";
import HWCSettings from "@core/settings/walletConnect/HWCSettings";
import { testnet, mainnet } from "@domain/context/network/Environment";
import { TransactionType } from "@port/out/TransactionResponseEnums";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock dependencies
const mockEventService = {
  emit: jest.fn(),
  on: jest.fn(),
} as unknown as EventService;

const mockNetworkService = {
  environment: testnet,
  configuration: { factoryAddress: "0.0.123" },
  consensusNodes: ["0.0.3"],
  rpcNode: { baseUrl: "https://testnet.hashio.io/api" },
} as unknown as NetworkService;

const mockMirrorNodeAdapter = {
  getAccountInfo: jest.fn(),
  getContractInfo: jest.fn(),
} as unknown as MirrorNodeAdapter;

describe("HederaWalletConnectTransactionAdapter", () => {
  let adapter: HederaWalletConnectTransactionAdapter;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create adapter with mocked dependencies
    adapter = new HederaWalletConnectTransactionAdapter(
      mockEventService,
      mockNetworkService,
      mockMirrorNodeAdapter,
    );
  });

  describe("constructor", () => {
    it("should initialize with default values", () => {
      expect((adapter as any).projectId).toBe("");
      expect((adapter as any).dappMetadata).toEqual({
        name: "",
        description: "",
        url: "",
        icons: [],
      });
    });
  });

  describe("init", () => {
    it("should emit walletInit event and return current network", async () => {
      const result = await adapter.init();

      expect(result).toBe(testnet);
      expect(mockEventService.emit).toHaveBeenCalledWith(
        WalletEvents.walletInit,
        expect.objectContaining({
          wallet: SupportedWallets.HWALLETCONNECT,
        }),
      );
    });

    it("should use provided network if given", async () => {
      const result = await adapter.init("mainnet");

      expect(result).toBe("mainnet");
    });
  });

  describe("register", () => {
    it("should throw NoSettings if hwcSettings is falsy", async () => {
      await expect(adapter.register(null as any)).rejects.toThrow(NoSettings);
    });

    it("should set projectId and dappMetadata from settings", async () => {
      const settings = {
        projectId: "test-project-id",
        dappName: "Test DApp",
        dappDescription: "Test Description",
        dappURL: "https://test.com",
      } as HWCSettings;

      // Mock connectWalletConnect to avoid actual connection
      adapter.connectWalletConnect = jest.fn().mockResolvedValue(testnet);
      adapter.getAccount = jest.fn().mockReturnValue(
        new Account({ id: "0.0.123", publicKey: undefined, evmAddress: "0xabc" }),
      );

      await adapter.register(settings);

      expect((adapter as any).projectId).toBe("test-project-id");
      expect((adapter as any).dappMetadata.name).toBe("Test DApp");
      expect((adapter as any).dappMetadata.description).toBe("Test Description");
      expect((adapter as any).dappMetadata.url).toBe("https://test.com");
    });
  });

  describe("processTransaction", () => {
    it("should throw NotInitialized if hederaProvider is not set", async () => {
      const tx = new Transaction();
      await expect(adapter.processTransaction(tx, TransactionType.RECEIPT)).rejects.toThrow(NotInitialized);
    });

    it("should throw AccountNotSet if account is not set", async () => {
      (adapter as any).hederaProvider = { request: jest.fn() };
      const tx = new Transaction();
      await expect(adapter.processTransaction(tx, TransactionType.RECEIPT)).rejects.toThrow(AccountNotSet);
    });

    it("should freeze transaction and send via hedera_signAndExecuteTransaction", async () => {
      const mockResult = { transactionId: "0.0.123@1234567890.000" };
      const mockRequest = jest.fn().mockResolvedValue(mockResult);

      (adapter as any).hederaProvider = {
        request: mockRequest,
        session: { namespaces: { hedera: {} } },
      };
      adapter.account = new Account({ id: "0.0.456", evmAddress: "0xabc" });

      const mockTx = {
        isFrozen: jest.fn().mockReturnValue(true),
        toBytes: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
      } as unknown as Transaction;

      // Need to bypass instanceof check since we're mocking
      Object.setPrototypeOf(mockTx, Transaction.prototype);

      const result = await adapter.processTransaction(mockTx, TransactionType.RECEIPT);

      expect(mockRequest).toHaveBeenCalledWith(
        {
          method: "hedera_signAndExecuteTransaction",
          params: expect.objectContaining({
            transactionList: expect.any(String),
            signerAccountId: expect.stringContaining("hedera:testnet:0.0.456"),
          }),
        },
        "hedera:testnet",
      );
      expect(result.id).toBe("0.0.123@1234567890.000");
    });

    it("should use mainnet chain ref when network is mainnet", async () => {
      const mockResult = { transactionId: "0.0.123@1234567890.000" };
      const mockRequest = jest.fn().mockResolvedValue(mockResult);

      (mockNetworkService as any).environment = mainnet;
      (adapter as any).hederaProvider = {
        request: mockRequest,
        session: { namespaces: { hedera: {} } },
      };
      adapter.account = new Account({ id: "0.0.456", evmAddress: "0xabc" });

      const mockTx = {
        isFrozen: jest.fn().mockReturnValue(true),
        toBytes: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
      } as unknown as Transaction;
      Object.setPrototypeOf(mockTx, Transaction.prototype);

      await adapter.processTransaction(mockTx, TransactionType.RECEIPT);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "hedera_signAndExecuteTransaction",
        }),
        "hedera:mainnet",
      );

      // Reset for other tests
      (mockNetworkService as any).environment = testnet;
    });

    it("should throw SigningError on request failure", async () => {
      (adapter as any).hederaProvider = {
        request: jest.fn().mockRejectedValue(new Error("Request failed")),
        session: { namespaces: { hedera: {} } },
      };
      adapter.account = new Account({ id: "0.0.456", evmAddress: "0xabc" });

      const mockTx = {
        isFrozen: jest.fn().mockReturnValue(true),
        toBytes: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
      } as unknown as Transaction;
      Object.setPrototypeOf(mockTx, Transaction.prototype);

      await expect(adapter.processTransaction(mockTx, TransactionType.RECEIPT)).rejects.toThrow(SigningError);
    });
  });

  describe("supportsEvmOperations", () => {
    it("should return true when in EVM session", () => {
      (adapter as any).hederaProvider = {
        session: { namespaces: { eip155: {} } },
      };
      expect(adapter.supportsEvmOperations()).toBe(true);
    });

    it("should return false when in native Hedera session", () => {
      (adapter as any).hederaProvider = {
        session: { namespaces: { hedera: {}, eip155: {} } },
      };
      expect(adapter.supportsEvmOperations()).toBe(false);
    });
  });

  describe("executeContractCall (EVM session override)", () => {
    const mockIface = new ethers.Interface(["function transfer(address,uint256)"]);

    it("should route through eth_sendTransaction when in EVM session", async () => {
      const mockTxHash = "0xabc123";
      const mockRequest = jest.fn().mockResolvedValue(mockTxHash);
      const mockWaitForTransaction = jest.fn().mockResolvedValue({ status: 1 });

      (adapter as any).hederaProvider = {
        request: mockRequest,
        session: { namespaces: { eip155: {} } },
      };
      adapter.account = new Account({ id: "0.0.456", evmAddress: "0xdeadbeef" });
      (mockMirrorNodeAdapter as any).getContractInfo = jest.fn().mockResolvedValue({
        evmAddress: "0x1234567890abcdef",
      });

      // Spy on the private rpcProvider method to return the mock provider
      const rpcProviderSpy = jest
        .spyOn(adapter as any, "rpcProvider")
        .mockReturnValue({ waitForTransaction: mockWaitForTransaction });

      try {
        await adapter.executeContractCall(
          "0.0.100",
          mockIface,
          "transfer",
          ["0x1234567890123456789012345678901234567890", 1000n],
          300000,
        );

        expect(mockRequest).toHaveBeenCalledWith(
          expect.objectContaining({ method: "eth_sendTransaction" }),
          "eip155:296",
        );
      } finally {
        rpcProviderSpy.mockRestore();
      }
    });

    it("should delegate to super.executeContractCall when in native session", async () => {
      (adapter as any).hederaProvider = {
        session: { namespaces: { hedera: {} } },
        request: jest.fn(),
      };
      adapter.account = new Account({ id: "0.0.456", evmAddress: "0xabc" });

      const superSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(adapter)), "executeContractCall")
        .mockResolvedValue({ id: "mock-response" } as any);

      await adapter.executeContractCall("0.0.100", mockIface, "transfer", ["0xrecipient", 1000n], 300000);

      expect(superSpy).toHaveBeenCalled();
      superSpy.mockRestore();
    });
  });

  describe("sign", () => {
    it("should throw NotInitialized if hederaProvider is not set", async () => {
      const tx = new Transaction();
      await expect(adapter.sign(tx)).rejects.toThrow(NotInitialized);
    });

    it("should throw SigningError if message is not a Transaction", async () => {
      (adapter as any).hederaProvider = {};
      adapter.account = new Account({ id: "0.0.456" });

      await expect(adapter.sign("some string")).rejects.toThrow(SigningError);
    });

    it("should throw ConsensusNodesNotSet if no consensus nodes", async () => {
      (adapter as any).hederaProvider = {};
      adapter.account = new Account({ id: "0.0.456" });
      (mockNetworkService as any).consensusNodes = [];

      const tx = new Transaction();
      await expect(adapter.sign(tx)).rejects.toThrow(ConsensusNodesNotSet);

      // Reset
      (mockNetworkService as any).consensusNodes = ["0.0.3"];
    });
  });

  describe("stop", () => {
    it("should disconnect provider and appKit", async () => {
      const mockDisconnect = jest.fn().mockResolvedValue(undefined);
      const mockAppKitDisconnect = jest.fn().mockResolvedValue(undefined);

      (adapter as any).hederaProvider = { disconnect: mockDisconnect };
      (adapter as any).appKit = { disconnect: mockAppKitDisconnect };

      const result = await adapter.stop();

      expect(result).toBe(true);
      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockAppKitDisconnect).toHaveBeenCalled();
      expect((adapter as any).hederaProvider).toBeUndefined();
      expect((adapter as any).appKit).toBeUndefined();
      expect((adapter as any).hederaAdapter).toBeUndefined();
      expect(mockEventService.emit).toHaveBeenCalledWith(
        WalletEvents.walletDisconnect,
        expect.objectContaining({
          wallet: SupportedWallets.HWALLETCONNECT,
        }),
      );
    });

    it("should return false and handle 'No active session' errors gracefully", async () => {
      (adapter as any).hederaProvider = {
        disconnect: jest.fn().mockRejectedValue(new Error("No active session")),
      };

      const result = await adapter.stop();

      expect(result).toBe(false);
    });

    it("should return false and log unknown errors", async () => {
      (adapter as any).hederaProvider = {
        disconnect: jest.fn().mockRejectedValue(new Error("Unknown error")),
      };

      const result = await adapter.stop();

      expect(result).toBe(false);
    });
  });

  describe("getAccount", () => {
    it("should return the account", () => {
      const account = new Account({ id: "0.0.123", evmAddress: "0xabc" });
      adapter.account = account;

      expect(adapter.getAccount()).toBe(account);
    });
  });

  describe("isEvmSession", () => {
    it("should return true when hedera namespace is not present", () => {
      (adapter as any).hederaProvider = {
        session: { namespaces: { eip155: {} } },
      };

      expect((adapter as any).isEvmSession()).toBe(true);
    });

    it("should return false when hedera namespace is present", () => {
      (adapter as any).hederaProvider = {
        session: { namespaces: { hedera: {}, eip155: {} } },
      };

      expect((adapter as any).isEvmSession()).toBe(false);
    });

    it("should return true when provider has no session", () => {
      (adapter as any).hederaProvider = {};

      expect((adapter as any).isEvmSession()).toBe(true);
    });
  });

  describe("isTestnet", () => {
    it("should return true when environment is testnet", () => {
      (mockNetworkService as any).environment = testnet;
      expect((adapter as any).isTestnet()).toBe(true);
    });

    it("should return false when environment is mainnet", () => {
      (mockNetworkService as any).environment = mainnet;
      expect((adapter as any).isTestnet()).toBe(false);

      // Reset
      (mockNetworkService as any).environment = testnet;
    });
  });

  describe("evmChainId", () => {
    it("should return 296 for testnet", () => {
      (mockNetworkService as any).environment = testnet;
      expect((adapter as any).evmChainId()).toBe("296");
    });

    it("should return 295 for mainnet", () => {
      (mockNetworkService as any).environment = mainnet;
      expect((adapter as any).evmChainId()).toBe("295");

      // Reset
      (mockNetworkService as any).environment = testnet;
    });
  });

  describe("subscribe", () => {
    it("should not throw when hederaProvider is not set", () => {
      (adapter as any).hederaProvider = undefined;
      expect(() => (adapter as any).subscribe()).not.toThrow();
    });

    it("should subscribe to provider events when initialized", () => {
      const mockOn = jest.fn();
      (adapter as any).hederaProvider = { on: mockOn };

      (adapter as any).subscribe();

      expect(mockOn).toHaveBeenCalledWith("session_delete", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("session_update", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("disconnect", expect.any(Function));
    });

    it("should subscribe to appKit state when appKit is available", () => {
      const mockOn = jest.fn();
      const mockSubscribeState = jest.fn();
      (adapter as any).hederaProvider = { on: mockOn };
      (adapter as any).appKit = { subscribeState: mockSubscribeState };

      (adapter as any).subscribe();

      expect(mockSubscribeState).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("ensureInitialized", () => {
    it("should throw NotInitialized when hederaProvider is not set", () => {
      expect(() => (adapter as any).ensureInitialized()).toThrow(NotInitialized);
    });

    it("should throw AccountNotSet when account is not set", () => {
      (adapter as any).hederaProvider = {};
      expect(() => (adapter as any).ensureInitialized()).toThrow(AccountNotSet);
    });

    it("should not throw when both are set", () => {
      (adapter as any).hederaProvider = {};
      adapter.account = new Account({ id: "0.0.123" });
      expect(() => (adapter as any).ensureInitialized()).not.toThrow();
    });
  });

  describe("ensureFrozen", () => {
    it("should freeze transaction if not frozen", () => {
      adapter.account = new Account({ id: "0.0.456" });
      const mockFreeze = jest.fn();
      const mockTx = {
        isFrozen: jest.fn().mockReturnValue(false),
        _freezeWithAccountId: mockFreeze,
      } as unknown as Transaction;

      (adapter as any).ensureFrozen(mockTx);

      expect(mockFreeze).toHaveBeenCalled();
    });

    it("should not freeze if already frozen", () => {
      adapter.account = new Account({ id: "0.0.456" });
      const mockFreeze = jest.fn();
      const mockTx = {
        isFrozen: jest.fn().mockReturnValue(true),
        _freezeWithAccountId: mockFreeze,
      } as unknown as Transaction;

      (adapter as any).ensureFrozen(mockTx);

      expect(mockFreeze).not.toHaveBeenCalled();
    });
  });
});
