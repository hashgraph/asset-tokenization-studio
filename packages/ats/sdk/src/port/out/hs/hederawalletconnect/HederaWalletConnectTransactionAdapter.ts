// SPDX-License-Identifier: Apache-2.0

import { singleton } from "tsyringe";
import { AccountId, ContractExecuteTransaction, Transaction } from "@hiero-ledger/sdk";
import { NetworkName } from "@hiero-ledger/sdk/lib/client/Client";
import { HederaTransactionAdapter } from "../HederaTransactionAdapter";
import { SigningError } from "@port/out/error/SigningError";
import { InitializationData } from "@port/out/TransactionAdapter";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { RPCTransactionResponseAdapter } from "@port/out/rpc/RPCTransactionResponseAdapter";
import { WalletEvents, WalletPairedEvent } from "@service/event/WalletEvent";
import LogService from "@service/log/LogService";
import EventService from "@service/event/EventService";
import NetworkService from "@service/network/NetworkService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import Injectable from "@core/injectable/Injectable";
import Hex from "@core/Hex";
import Account from "@domain/context/account/Account";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { Environment, testnet } from "@domain/context/network/Environment";
import { SupportedWallets } from "@domain/context/network/Wallet";
import HWCSettings from "@core/settings/walletConnect/HWCSettings";
import { NotInitialized } from "./error/NotInitialized";
import { AccountNotSet } from "./error/AccountNotSet";
import { NoSettings } from "./error/NoSettings";
import { AccountNotFound } from "../error/AccountNotFound";
import { ConsensusNodesNotSet } from "./error/ConsensusNodesNotSet";
import { SignatureNotFound } from "./error/SignatureNotFound";
import { TransactionType } from "@port/out/TransactionResponseEnums";
import { ethers } from "ethers";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Lazy imports for browser-only HWC v2 dependencies
let HederaAdapter: any;
let HederaChainDefinition: any;
let hederaNamespace: any;
let HederaProvider: any;
let base64StringToSignatureMap: any;
let createAppKit: any;

if (typeof window !== "undefined") {
  const hwc = require("@hashgraph/hedera-wallet-connect");
  HederaAdapter = hwc.HederaAdapter;
  HederaChainDefinition = hwc.HederaChainDefinition;
  hederaNamespace = hwc.hederaNamespace;
  HederaProvider = hwc.HederaProvider;
  base64StringToSignatureMap = hwc.base64StringToSignatureMap;

  const appkit = require("@reown/appkit");
  createAppKit = appkit.createAppKit;
}

@singleton()
export class HederaWalletConnectTransactionAdapter extends HederaTransactionAdapter {
  public account: Account;
  protected network: Environment;
  protected projectId: string;
  protected dappMetadata: { name: string; description: string; url: string; icons: string[] };

  // HWC v2 properties
  protected hederaAdapter: any;
  protected appKit: any;
  protected hederaProvider: any;

  constructor(
    @lazyInject(EventService)
    private readonly eventService: EventService,
    @lazyInject(NetworkService)
    protected readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    protected readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {
    super(mirrorNodeAdapter, networkService);
    this.projectId = "";
    this.dappMetadata = {
      name: "",
      description: "",
      url: "",
      icons: [],
    };
  }

  public async init(network?: NetworkName): Promise<string> {
    LogService.logInfo("Initializing with network:", network);
    const currentNetwork = network ?? this.networkService.environment;

    this.eventService.emit(WalletEvents.walletInit, {
      initData: {
        account: this.account,
        pairing: "",
        topic: "",
      },
      wallet: SupportedWallets.HWALLETCONNECT,
    });
    LogService.logInfo("Hedera WalletConnect v2 handler initialized");
    return currentNetwork;
  }

  public async register(hwcSettings: HWCSettings): Promise<InitializationData> {
    LogService.logInfo("Registering Hedera WalletConnect v2...");
    Injectable.registerTransactionHandler(this);

    if (!hwcSettings) {
      LogService.logError("Error: Hedera WalletConnect settings not set");
      throw new NoSettings();
    }

    this.projectId = hwcSettings.projectId ?? "";
    this.dappMetadata = {
      name: hwcSettings.dappName ?? "",
      description: hwcSettings.dappDescription ?? "",
      url: hwcSettings.dappURL ?? "",
      icons: [],
    };

    await this.connectWalletConnect();

    LogService.logInfo("Register completed. Returning account information.");
    return { account: this.getAccount() };
  }

  public async connectWalletConnect(network?: string): Promise<string> {
    LogService.logInfo("Connecting to WalletConnect v2 with network:", network);
    const currentNetwork = network ?? this.networkService.environment;

    if (this.hederaProvider) {
      LogService.logTrace("Existing provider detected. Stopping...");
      await this.stop();
    }

    await this.initAdaptersAndProvider(currentNetwork);
    await this.openPairingModal();
    await this.resolveAndCacheAccount(currentNetwork);
    this.subscribe();

    LogService.logInfo("connectWalletConnect completed.");
    return currentNetwork;
  }

  public async stop(): Promise<boolean> {
    try {
      await this.hederaProvider?.disconnect();
      await this.appKit?.disconnect();
      this.hederaAdapter = undefined;
      this.appKit = undefined;
      this.hederaProvider = undefined;

      this.eventService.emit(WalletEvents.walletDisconnect, {
        wallet: SupportedWallets.HWALLETCONNECT,
      });
      LogService.logInfo("Hedera WalletConnect v2 stopped successfully");
      return true;
    } catch (error) {
      const msg = (error as Error)?.message ?? String(error);
      if (msg.includes("No active session") || msg.includes("No matching key")) {
        LogService.logInfo("No active WalletConnect session found");
      } else {
        LogService.logError(`Error stopping Hedera WalletConnect: ${msg}`);
      }
      return false;
    }
  }

  public async restart(network: NetworkName): Promise<void> {
    await this.stop();
    await this.init(network);
  }

  public async signAndSendTransaction(
    transaction: Transaction,
    _transactionType?: TransactionType,
    _functionName?: string,
    _abi?: object[],
  ): Promise<TransactionResponse> {
    LogService.logInfo("[HWC v2] Signing and sending transaction...");
    this.ensureInitialized();

    // Route EVM sessions through eth_sendTransaction for contract calls
    if (this.isEvmSession() && transaction instanceof ContractExecuteTransaction) {
      return this.signAndSendTransactionViaEvm(transaction);
    }

    try {
      this.ensureFrozen(transaction);

      const transactionBytes = transaction.toBytes();
      const transactionBase64 = Buffer.from(transactionBytes).toString("base64");

      const chainRef = this.isTestnet() ? "hedera:testnet" : "hedera:mainnet";

      const params = {
        transactionList: transactionBase64,
        signerAccountId: `${chainRef}:${this.account.id.toString()}`,
      };

      LogService.logTrace(`[HWC v2] Sending transaction for signing: ${JSON.stringify(params)}`);

      const result = await this.hederaProvider.request(
        {
          method: "hedera_signAndExecuteTransaction",
          params,
        },
        chainRef as any,
      );

      LogService.logInfo("[HWC v2] Transaction signed and sent successfully");
      LogService.logTrace(`[HWC v2] Result: ${JSON.stringify(result)}`);

      const txResponse = result as any;
      return new TransactionResponse(
        txResponse?.transactionId || txResponse?.result?.transactionId || "",
        txResponse,
      );
    } catch (error) {
      if (error instanceof Error) {
        LogService.logError(error.stack);
      }
      throw new SigningError(error instanceof Object ? JSON.stringify(error, null, 2) : error);
    }
  }

  async sign(message: string | Transaction): Promise<string> {
    LogService.logInfo("[HWC v2] Signing transaction...");
    this.ensureInitialized();

    if (!(message instanceof Transaction)) {
      throw new SigningError("Hedera WalletConnect must sign a transaction not a string");
    }

    if (!this.networkService.consensusNodes || this.networkService.consensusNodes.length === 0) {
      throw new ConsensusNodesNotSet();
    }

    try {
      this.ensureFrozen(message);

      const bodyBytes = message._signedTransactions.get(0).bodyBytes;
      if (!bodyBytes) {
        throw new Error("No body bytes found in frozen transaction");
      }
      const transactionBodyBase64 = Buffer.from(bodyBytes).toString("base64");

      const chainRef = this.isTestnet() ? "hedera:testnet" : "hedera:mainnet";

      const params = {
        transactionBody: transactionBodyBase64,
        signerAccountId: `${chainRef}:${this.account.id.toString()}`,
      };

      LogService.logTrace(`[HWC v2] Signing tx for account: ${this.account.id.toString()}`);

      const signResult = await this.hederaProvider.request(
        {
          method: "hedera_signTransaction",
          params,
        },
        chainRef as any,
      );

      LogService.logInfo("[HWC v2] Transaction signed successfully");
      LogService.logTrace(`Signature result: ${JSON.stringify(signResult)}`);

      const resultAny = signResult as any;
      const base64SigMap = resultAny?.signatureMap;

      if (!base64SigMap || typeof base64SigMap !== "string") {
        throw new SignatureNotFound("No signatureMap returned from WalletConnect sign");
      }

      const signatureMap = base64StringToSignatureMap(base64SigMap);

      if (!signatureMap.sigPair || signatureMap.sigPair.length === 0) {
        throw new SignatureNotFound();
      }

      const firstPair = signatureMap.sigPair[0];
      const signature = firstPair.ed25519 || firstPair.ECDSASecp256k1 || firstPair.ECDSA_384;

      if (!signature) {
        throw new SignatureNotFound(JSON.stringify(firstPair, null, 2));
      }

      const hexSignature = Hex.fromUint8Array(
        signature instanceof Uint8Array ? signature : new Uint8Array(signature),
      );
      LogService.logTrace(`Final hex signature: ${hexSignature}`);
      return hexSignature;
    } catch (error) {
      throw new SigningError(JSON.stringify(error, null, 2));
    }
  }

  getAccount(): Account {
    return this.account;
  }

  // ===== Private helpers =====

  private async initAdaptersAndProvider(currentNetwork: string): Promise<void> {
    const isTest = currentNetwork === testnet;

    const nativeNetworks = isTest
      ? [HederaChainDefinition.Native.Testnet, HederaChainDefinition.Native.Mainnet]
      : [HederaChainDefinition.Native.Mainnet, HederaChainDefinition.Native.Testnet];

    const evmNetworks = isTest
      ? [HederaChainDefinition.EVM.Testnet, HederaChainDefinition.EVM.Mainnet]
      : [HederaChainDefinition.EVM.Mainnet, HederaChainDefinition.EVM.Testnet];

    this.hederaAdapter = new HederaAdapter({
      projectId: this.projectId,
      networks: nativeNetworks,
      namespace: hederaNamespace,
    });

    const eip155HederaAdapter = new HederaAdapter({
      projectId: this.projectId,
      networks: evmNetworks,
      namespace: "eip155",
    });

    const eip155Chains = isTest ? ["eip155:296", "eip155:295"] : ["eip155:295", "eip155:296"];
    const hederaChains = isTest ? ["hedera:testnet", "hedera:mainnet"] : ["hedera:mainnet", "hedera:testnet"];

    const rpcUrl =
      this.networkService.rpcNode?.baseUrl ||
      (isTest ? "https://testnet.hashio.io/api" : "https://mainnet.hashio.io/api");

    const providerOpts = {
      projectId: this.projectId,
      metadata: this.dappMetadata,
      logger: "error" as const,
      optionalNamespaces: {
        hedera: {
          methods: [
            "hedera_getNodeAddresses",
            "hedera_executeTransaction",
            "hedera_signMessage",
            "hedera_signAndExecuteQuery",
            "hedera_signAndExecuteTransaction",
            "hedera_signTransaction",
          ],
          chains: hederaChains,
          events: ["chainChanged", "accountsChanged"],
        },
        eip155: {
          methods: [
            "eth_sendTransaction",
            "eth_signTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTypedData",
            "eth_signTypedData_v4",
            "eth_accounts",
            "eth_chainId",
          ],
          chains: eip155Chains,
          events: ["chainChanged", "accountsChanged"],
          rpcMap: {
            "eip155:296": isTest ? rpcUrl : "https://testnet.hashio.io/api",
            "eip155:295": isTest ? "https://mainnet.hashio.io/api" : rpcUrl,
          },
        },
      },
    };

    this.hederaProvider = await HederaProvider.init(providerOpts);

    this.appKit = createAppKit({
      adapters: [this.hederaAdapter, eip155HederaAdapter],
      universalProvider: this.hederaProvider,
      projectId: this.projectId,
      metadata: this.dappMetadata,
      networks: [
        HederaChainDefinition.Native.Testnet,
        HederaChainDefinition.Native.Mainnet,
        HederaChainDefinition.EVM.Testnet,
        HederaChainDefinition.EVM.Mainnet,
      ],
      features: {
        analytics: true,
        socials: false,
        swaps: false,
        onramp: false,
        email: false,
      },
    });

    LogService.logInfo(`[HWC v2] Initialized with network ${currentNetwork}`);
  }

  private async openPairingModal(): Promise<void> {
    if (!this.appKit) throw new NotInitialized();

    await this.appKit.open();
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error("Connection timeout (5 min)"));
      }, 300000);

      const unsubscribe = this.appKit.subscribeState((state: any) => {
        if (state.open === false) {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        }
      });
    });

    // Let provider settle after modal close
    await new Promise((r) => setTimeout(r, 300));
  }

  private async resolveAndCacheAccount(currentNetwork: string): Promise<void> {
    if (!this.hederaProvider) throw new NotInitialized();

    const hederaAccount = this.hederaProvider.getAccountAddresses()[0];
    if (!hederaAccount) {
      throw new AccountNotFound();
    }

    LogService.logInfo(`[HWC v2] Provided account: ${hederaAccount}`);

    const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(hederaAccount);

    if (!accountMirror) {
      throw new AccountNotFound();
    }

    this.account = new Account({
      id: accountMirror.id?.toString() ?? hederaAccount,
      publicKey: accountMirror.publicKey,
      evmAddress: accountMirror.evmAddress,
    });

    this.network = this.networkService.environment;

    LogService.logInfo(`[HWC v2] Paired with account: ${this.account.id.toString()}`);

    const eventData: WalletPairedEvent = {
      wallet: SupportedWallets.HWALLETCONNECT,
      data: {
        account: this.account,
        pairing: "",
        topic: "",
      },
      network: {
        name: this.networkService.environment,
        recognized: true,
        factoryId: this.networkService.configuration ? this.networkService.configuration.factoryAddress : "",
      },
    };
    this.eventService.emit(WalletEvents.walletPaired, eventData);
  }

  private subscribe(): void {
    if (!this.hederaProvider) {
      LogService.logInfo("[HWC v2] Not initialized; cannot subscribe to events");
      return;
    }

    this.hederaProvider.on("session_delete", async () => {
      await this.stop();
    });

    this.hederaProvider.on("session_update", async (event: unknown) => {
      LogService.logInfo(`[HWC v2] Session updated: ${JSON.stringify(event)}`);
    });

    this.hederaProvider.on("disconnect", async () => {
      await this.stop();
    });

    if (this.appKit) {
      this.appKit.subscribeState((state: unknown) => {
        LogService.logTrace(`[HWC v2] AppKit state: ${JSON.stringify(state)}`);
      });
    }
  }

  /**
   * Route a ContractExecuteTransaction through eth_sendTransaction for EVM-only sessions.
   * Extracts the contract ID and encoded function data from the transaction.
   */
  private async signAndSendTransactionViaEvm(
    transaction: ContractExecuteTransaction,
  ): Promise<TransactionResponse> {
    if (!this.account.evmAddress) {
      throw new AccountNotSet();
    }

    // Extract contract ID and resolve to EVM address
    const contractId = (transaction as any)._contractId?.toString();
    if (!contractId) {
      throw new SigningError("ContractExecuteTransaction has no contractId");
    }

    let toAddress = contractId;
    if (contractId.match(/^0\.0\.\d+$/)) {
      const contractInfo = await this.mirrorNodeAdapter.getContractInfo(contractId);
      toAddress = contractInfo.evmAddress;
    }

    // Extract the encoded function parameters
    const functionParams = (transaction as any)._functionParameters;
    const data = functionParams ? "0x" + Buffer.from(functionParams).toString("hex") : "0x";
    const gas = (transaction as any)._gas?.toNumber?.() ?? (transaction as any)._gas ?? 300000;

    const chainRef = this.currentEvmChainRef();

    const txParams: Record<string, string> = {
      from: this.account.evmAddress,
      to: toAddress.startsWith("0x") ? toAddress : `0x${toAddress}`,
      data,
      gas: ethers.toBeHex(gas),
    };

    const payableAmount = (transaction as any)._payableAmount;
    if (payableAmount) {
      txParams.value = ethers.toBeHex(payableAmount);
    }

    LogService.logTrace(`[HWC v2 EVM] Sending eth_sendTransaction: ${JSON.stringify(txParams)}`);

    const txHash = await this.hederaProvider.request(
      { method: "eth_sendTransaction", params: [txParams] },
      chainRef,
    );

    const provider = this.rpcProvider();
    const receipt = await provider.waitForTransaction(txHash as string);

    const responsePayload = {
      hash: txHash,
      wait: () => Promise.resolve(receipt),
    } as any;

    return RPCTransactionResponseAdapter.manageResponse(responsePayload, this.networkService.environment);
  }

  private ensureInitialized(): void {
    if (!this.hederaProvider) throw new NotInitialized();
    if (!this.account) throw new AccountNotSet();
  }

  private ensureFrozen(tx: Transaction): void {
    if (!tx.isFrozen()) {
      tx._freezeWithAccountId(AccountId.fromString(this.account.id.toString()));
    }
  }

  private isTestnet(): boolean {
    return this.networkService.environment === testnet;
  }

  private isEvmSession(): boolean {
    return !this.hederaProvider?.session?.namespaces?.hedera;
  }

  private evmChainId(): "295" | "296" {
    return this.isTestnet() ? "296" : "295";
  }

  private currentEvmChainRef(): `eip155:${string}` {
    return `eip155:${this.evmChainId()}`;
  }

  private rpcProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(this.networkService.rpcNode?.baseUrl);
  }
}
