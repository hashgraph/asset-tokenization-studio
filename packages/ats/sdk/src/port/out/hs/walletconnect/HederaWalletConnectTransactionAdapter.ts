// SPDX-License-Identifier: Apache-2.0

import { singleton } from "tsyringe";
import { AccountId, ContractCreateTransaction, Transaction, TransactionId } from "@hiero-ledger/sdk";
import { NetworkName } from "@hiero-ledger/sdk/lib/client/Client";
import { BaseHederaTransactionAdapter } from "../BaseHederaTransactionAdapter";
import { SigningError } from "@port/out/error/SigningError";
import { InitializationData } from "@port/out/TransactionAdapter";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { RPCTransactionResponseAdapter } from "@port/out/response/RPCTransactionResponseAdapter";
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

let _hwcDepsLoaded = false;
async function loadHWCDeps(): Promise<void> {
  if (_hwcDepsLoaded || typeof window === "undefined") return;
  _hwcDepsLoaded = true;
  type HWC = typeof import("@hashgraph/hedera-wallet-connect");
  type AppKit = typeof import("@reown/appkit");
  const [hwc, appkit]: [HWC, AppKit] = await Promise.all([
    import("@hashgraph/hedera-wallet-connect"),
    import("@reown/appkit"),
  ]);
  HederaAdapter = hwc.HederaAdapter;
  HederaChainDefinition = hwc.HederaChainDefinition;
  hederaNamespace = hwc.hederaNamespace;
  HederaProvider = hwc.HederaProvider;
  base64StringToSignatureMap = hwc.base64StringToSignatureMap;
  createAppKit = appkit.createAppKit;
}

@singleton()
export class HederaWalletConnectTransactionAdapter extends BaseHederaTransactionAdapter {
  public account: Account;
  protected network: Environment;
  protected projectId: string;
  protected dappMetadata: { name: string; description: string; url: string; icons: string[] };

  // HWC v2 properties
  protected hederaAdapter: any;
  protected eip155Adapter: any;
  protected appKit: any;
  protected hederaProvider: any;
  protected injectedEip155Provider: any | undefined;
  private _isConnecting = false;
  private _hederaSessionCaptured = false;

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

    this._isConnecting = true;
    try {
      // Snapshot whether AppKit already exists before init.
      // initAdaptersAndProvider is a singleton: it creates adapters/AppKit only
      // once and returns early on subsequent calls.
      const appKitExistedBefore = !!this.appKit;
      await this.initAdaptersAndProvider(currentNetwork);

      if (!appKitExistedBefore && this.appKit) {
        // AppKit's constructor fires initialize() as a background async task.
        // That task calls unSyncExistingConnection() → ConnectionController
        // .disconnect() → ModalController.close(), which would immediately
        // close the pairing modal we are about to open.
        // A short fixed delay is enough because unSyncExistingConnection only
        // does in-memory work (no network I/O) and completes in <100 ms.
        await new Promise((r) => setTimeout(r, 500));
        LogService.logInfo("[HWC v2] AppKit initialization settled; opening pairing modal");
      }

      await this.openPairingModal();

      // ── Path A: WalletConnect session ──────────────────────────────────────
      // _hederaSessionCaptured is set eagerly inside openPairingModal's
      // subscribeState callback the moment the session appears (AppKit may set
      // and then clear it before modal close). Also poll hederaProvider.session
      // as a safety net in case it appears after the modal closes.
      if (!this._hederaSessionCaptured && !this.hederaProvider?.session) {
        const pollEnd = Date.now() + 2000;
        while (!this._hederaSessionCaptured && !this.hederaProvider?.session && Date.now() < pollEnd) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      if (this._hederaSessionCaptured || this.hederaProvider?.session) {
        // Safety net: eip155 WC session but eip155Provider not initialised means
        // MetaMask approved WC but has no Hedera EVM chain configured.
        if (this.isEvmSession() && !(this.hederaProvider as any)?.eip155Provider) {
          const accounts: string[] = (this.hederaProvider as any)?.session?.namespaces?.eip155?.accounts ?? [];
          const allChains = [...new Set(accounts.map((acc) => acc.split(":").slice(0, 2).join(":")))];
          await this.stop();
          throw new Error(
            `MetaMask is not connected to a Hedera EVM network` +
              (allChains.length ? ` (connected on: ${allChains.join(", ")})` : "") +
              `. Please add Hedera EVM Testnet (chainId 296) or Mainnet (chainId 295) to MetaMask, ` +
              `switch to it, and try connecting again.`,
          );
        }
        await this.resolveAndCacheAccount(currentNetwork);
        this.subscribe();
        LogService.logInfo("connectWalletConnect completed.");
        return currentNetwork;
      }

      // ── Path B: EIP-1193 injected provider (MetaMask browser extension) ────
      // injectedEip155Provider may already have been captured eagerly inside
      // openPairingModal's subscribeState callback (to avoid the race where
      // AppKit sets and then clears activeInjectedProvider before modal closes).
      // Fall back to polling activeInjectedProvider as a safety net.
      if (!this.injectedEip155Provider) {
        const pollEnd = Date.now() + 2000;
        while (!this.injectedEip155Provider && Date.now() < pollEnd) {
          await new Promise((r) => setTimeout(r, 100));
          const p = (this.eip155Adapter as any)?.activeInjectedProvider;
          if (p) this.injectedEip155Provider = p;
        }
      }
      if (this.injectedEip155Provider) {
        await this.resolveAndCacheAccountFromInjected(currentNetwork);
        this.subscribeInjected();
        LogService.logInfo("connectWalletConnect completed via injected provider.");
        return currentNetwork;
      }

      // ── Path C: Nothing connected (user cancelled) ─────────────────────────
      await this.stop();
      throw new Error("No wallet was connected. Please open the modal and select a wallet to continue.");
    } finally {
      this._isConnecting = false;
    }
  }

  public subscribeInjected(): void {
    if (!this.injectedEip155Provider) return;

    const provider = this.injectedEip155Provider as any;

    const onAccountsChanged = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        await this.stop();
      }
    };
    const onChainChanged = async (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      const hederaChainId = this.isTestnet() ? 296 : 295;
      if (chainId !== hederaChainId) {
        LogService.logInfo(`[HWC Injected] Chain changed to ${chainId}, disconnecting`);
        await this.stop();
      }
    };

    provider.on?.("accountsChanged", onAccountsChanged);
    provider.on?.("chainChanged", onChainChanged);
  }

  public async stop(): Promise<boolean> {
    let success = true;
    try {
      await this.hederaProvider?.disconnect();
      await this.appKit?.disconnect();
    } catch (error) {
      const msg = (error as Error)?.message ?? String(error);
      if (msg.includes("No active session") || msg.includes("No matching key")) {
        LogService.logInfo("No active WalletConnect session found");
      } else {
        LogService.logError(`Error stopping Hedera WalletConnect: ${msg}`);
      }
      success = false;
    } finally {
      // Keep hederaProvider, appKit, hederaAdapter and eip155Adapter alive —
      // they are singletons. AppKit holds refs to the original adapter instances
      // and sets activeInjectedProvider on them; clearing them breaks EIP-6963
      // detection on reconnect.
      this.injectedEip155Provider = undefined;
      this._hederaSessionCaptured = false;

      this.eventService.emit(WalletEvents.walletDisconnect, {
        wallet: SupportedWallets.HWALLETCONNECT,
      });
      LogService.logInfo("Hedera WalletConnect v2 stopped successfully");
    }
    return success;
  }

  public async restart(network: NetworkName): Promise<void> {
    await this.stop();
    await this.init(network);
  }

  public async processTransaction(
    transaction: Transaction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _transactionType: TransactionType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _startDate?: string,
  ): Promise<TransactionResponse> {
    return await this.executeNativeTransaction(transaction);
  }

  private async executeNativeTransaction(transaction: Transaction): Promise<TransactionResponse> {
    LogService.logInfo(`[HWC Native] Executing ${transaction.constructor.name}`);
    this.ensureInitialized();
    this.ensureNativeProviderReady();

    try {
      this.ensureFrozen(transaction);
      LogService.logTrace(`[HWC Native] Transaction frozen for account ${this.account.id.toString()}`);

      const transactionBytes = transaction.toBytes();
      const transactionBase64 = Buffer.from(transactionBytes).toString("base64");
      LogService.logTrace(`[HWC Native] Transaction serialized, size: ${transactionBytes.length} bytes`);

      const chainRef = this.isTestnet() ? "hedera:testnet" : "hedera:mainnet";

      const params = {
        transactionList: transactionBase64,
        signerAccountId: `${chainRef}:${this.account.id.toString()}`,
      };

      LogService.logInfo(`[HWC Native] Sending transaction for signing...`);
      LogService.logTrace(`[HWC Native] Execute params: ${JSON.stringify(params)}`);

      const result = await this.hederaProvider.request(
        { method: "hedera_signAndExecuteTransaction", params },
        chainRef as any,
      );

      LogService.logInfo("[HWC Native] Transaction executed successfully");
      LogService.logTrace(`[HWC Native] Result: ${JSON.stringify(result)}`);

      const txResponse = result as any;
      return new TransactionResponse(
        txResponse?.transactionId || txResponse?.result?.transactionId || "",
        txResponse,
      );
    } catch (error) {
      LogService.logError("[HWC Native] Error executing transaction:", error);
      if (error instanceof Error) {
        LogService.logError(error.stack);
      }
      throw new SigningError(error instanceof Object ? JSON.stringify(error, null, 2) : error);
    }
  }

  public supportsEvmOperations(): boolean {
    return this.isEvmSession();
  }

  public async executeContractCall(
    contractId: string,
    iface: ethers.Interface,
    functionName: string,
    params: unknown[],
    gasLimit: number,
    transactionType?: TransactionType,
    payableAmountHbar?: string,
    startDate?: string,
    evmAddress?: string,
  ): Promise<TransactionResponse> {
    if (!this.isEvmSession()) {
      return super.executeContractCall(
        contractId,
        iface,
        functionName,
        params,
        gasLimit,
        transactionType,
        payableAmountHbar,
        startDate,
        evmAddress,
      );
    }

    this.ensureInitialized();
    if (!this.account.evmAddress) throw new AccountNotSet();

    // Resolve contract EVM address
    let toAddress = evmAddress ?? contractId;
    if (!toAddress || toAddress.match(/^0\.0\.\d+$/)) {
      const contractInfo = await this.mirrorNodeAdapter.getContractInfo(contractId);
      toAddress = contractInfo.evmAddress;
    }

    return await this.executeEvmContractCall(toAddress, iface, functionName, params, gasLimit, payableAmountHbar);
  }

  private async executeEvmContractCall(
    proxyAddress: string,
    iface: ethers.Interface,
    functionName: string,
    params: unknown[],
    gasLimit: number,
    payableAmountHbar?: string,
  ): Promise<TransactionResponse> {
    const encodedHex = iface.encodeFunctionData(functionName, params as any[]);
    const to = proxyAddress.startsWith("0x") ? proxyAddress : `0x${proxyAddress}`;

    // ── EIP-1193 injected provider path (MetaMask browser extension) ────
    if (this.injectedEip155Provider) {
      const txParams: Record<string, string> = {
        from: this.account.evmAddress!,
        to,
        data: encodedHex,
        gas: ethers.toBeHex(gasLimit),
      };
      if (payableAmountHbar) {
        txParams.value = ethers.toBeHex(ethers.parseEther(payableAmountHbar));
      }
      const txHash = await (this.injectedEip155Provider as any).request({
        method: "eth_sendTransaction",
        params: [txParams],
      });
      const provider = this.rpcProvider();
      const receipt = await provider.waitForTransaction(txHash as string);
      const responsePayload = { hash: txHash, wait: () => Promise.resolve(receipt) } as any;
      return RPCTransactionResponseAdapter.manageResponse(responsePayload, this.networkService.environment);
    }

    // ── WalletConnect EVM session path ───────────────────────────────────
    const chainRef = this.currentEvmChainRef();
    const txParams: Record<string, string> = {
      from: this.account.evmAddress!,
      to,
      data: encodedHex,
      gas: ethers.toBeHex(gasLimit),
    };
    if (payableAmountHbar) {
      txParams.value = ethers.toBeHex(ethers.parseEther(payableAmountHbar));
    }

    LogService.logTrace(`[HWC v2 EVM] Sending eth_sendTransaction: ${JSON.stringify(txParams)}`);

    const txHash = await this.hederaProvider.request(
      { method: "eth_sendTransaction", params: [txParams] },
      chainRef,
    );
    const provider = this.rpcProvider();
    const receipt = await provider.waitForTransaction(txHash as string);
    const responsePayload = { hash: txHash, wait: () => Promise.resolve(receipt) } as any;
    return RPCTransactionResponseAdapter.manageResponse(responsePayload, this.networkService.environment);
  }

  public async deployContract(bytecodeHex: string, gas: number): Promise<TransactionResponse> {
    const hex = bytecodeHex.startsWith("0x") ? bytecodeHex.slice(2) : bytecodeHex;
    const bytecode = Uint8Array.from(Buffer.from(hex, "hex"));

    if (this.isEvmSession()) {
      // EVM path (MetaMask): standard EVM contract deployment — eth_sendTransaction with no `to`
      this.ensureInitialized();
      if (!this.account.evmAddress) throw new AccountNotSet();

      const chainRef = this.currentEvmChainRef();
      const txParams: Record<string, string> = {
        from: this.account.evmAddress,
        data: `0x${hex}`,
        gas: ethers.toBeHex(gas),
      };

      LogService.logTrace(`[HWC v2 EVM] Deploying contract via eth_sendTransaction: ${JSON.stringify(txParams)}`);

      const txHash = await this.hederaProvider.request(
        { method: "eth_sendTransaction", params: [txParams] },
        chainRef,
      );

      const provider = this.rpcProvider();
      const receipt = await provider.waitForTransaction(txHash as string);
      const responsePayload = { hash: txHash, wait: () => Promise.resolve(receipt) } as any;
      return RPCTransactionResponseAdapter.manageResponse(responsePayload, this.networkService.environment);
    }

    // Native Hedera path: ContractCreateTransaction with inline initcode.
    // We pre-freeze the transaction (set transactionId + nodeAccountId) before sending to the
    // wallet so that HashPack can sign the existing bodyBytes directly without needing to
    // re-encode the transaction body. Re-encoding would strip proto field 16 (initcode) from
    // older wallet proto definitions, causing INVALID_FILE_ID.
    LogService.logTrace("[HWC v2 Native] Deploying contract — pre-freezing ContractCreate with setBytecode");

    const accountId = AccountId.fromString(this.account.id.toString());
    // 0.0.3 is a consensus node available on both testnet and mainnet
    const nodeId = AccountId.fromString("0.0.3");

    const contractCreate = new ContractCreateTransaction()
      .setBytecode(bytecode)
      .setGas(gas)
      .setTransactionId(TransactionId.generate(accountId))
      .setNodeAccountIds([nodeId])
      .freeze();

    return this.processTransaction(contractCreate, TransactionType.RECEIPT);
  }

  async sign(message: string | Transaction): Promise<string> {
    LogService.logInfo("[HWC v2] Signing transaction...");
    this.ensureInitialized();
    this.ensureNativeProviderReady();

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

  public getNetworkService(): NetworkService {
    return this.networkService;
  }

  public getMirrorNodeAdapter(): MirrorNodeAdapter {
    return this.mirrorNodeAdapter;
  }

  // ===== Private helpers =====

  private async initAdaptersAndProvider(currentNetwork: string): Promise<void> {
    await loadHWCDeps();
    const isTest = currentNetwork === testnet;

    const nativeNetworks = isTest
      ? [HederaChainDefinition.Native.Testnet, HederaChainDefinition.Native.Mainnet]
      : [HederaChainDefinition.Native.Mainnet, HederaChainDefinition.Native.Testnet];

    const evmNetworks = isTest
      ? [HederaChainDefinition.EVM.Testnet, HederaChainDefinition.EVM.Mainnet]
      : [HederaChainDefinition.EVM.Mainnet, HederaChainDefinition.EVM.Testnet];

    // Adapters, provider and AppKit are singletons — create only once.
    // On reconnect the same instances must be reused: AppKit holds refs to the
    // original adapters and sets activeInjectedProvider on them; creating new
    // instances would break EIP-6963 detection on the second connect.
    if (this.hederaAdapter && this.eip155Adapter) {
      LogService.logInfo("[HWC v2] Reusing existing adapters for reconnect");
      return;
    }

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
    // Store so connectWalletConnect can detect EIP-1193 (MetaMask extension) connections
    this.eip155Adapter = eip155HederaAdapter;

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
            // Required so EIP155Provider.switchChain forwards these to MetaMask via
            // WalletConnect when AppKit's "Switch network" flow is triggered.
            "wallet_switchEthereumChain",
            "wallet_addEthereumChain",
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

    this.patchInitProvidersPrototype();
    try {
      this.hederaProvider = await HederaProvider.init(providerOpts);
    } catch (error: any) {
      if (error?.message?.includes("No RPC url provided for chainId")) {
        LogService.logTrace(
          "[HWC v2] Stale session with non-Hedera chains detected. Clearing WalletConnect storage and retrying...",
        );
        this.clearWalletConnectStorage();
        this.hederaProvider = await HederaProvider.init(providerOpts);
      } else {
        throw error;
      }
    }
    this.patchInitProviders();

    try {
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
        enableReconnect: false,
        features: {
          analytics: true,
          socials: false,
          swaps: false,
          onramp: false,
          email: false,
        },
      });
    } catch (error) {
      // If createAppKit fails (e.g. adapter version mismatch), clear all
      // singleton state so the next connect attempt starts fresh instead of
      // hitting NotInitialized on openPairingModal.
      LogService.logError(`[HWC v2] createAppKit failed — resetting adapter state: ${(error as Error)?.message}`);
      this.hederaAdapter = undefined as any;
      this.eip155Adapter = undefined as any;
      this.hederaProvider = undefined as any;
      this.appKit = undefined as any;
      throw error;
    }

    LogService.logInfo(`[HWC v2] Initialized with network ${currentNetwork}`);
  }

  private async openPairingModal(): Promise<void> {
    if (!this.appKit) throw new NotInitialized();

    await this.appKit.open();
    let stateChangeCount = 0;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error("Connection timeout (5 min)"));
      }, 300000);

      const unsubscribe = this.appKit.subscribeState((state: any) => {
        stateChangeCount++;
        const session = this.hederaProvider?.session;
        const injected = (this.eip155Adapter as any)?.activeInjectedProvider;
        LogService.logInfo(
          `[HWC Modal] state#${stateChangeCount} open=${state.open} ` +
            `hederaSession=${!!session} injectedProvider=${!!injected} ` +
            `_hederaSessionCaptured=${this._hederaSessionCaptured} ` +
            `_injectedCaptured=${!!this.injectedEip155Provider}`,
        );

        if (session && !this._hederaSessionCaptured) {
          this._hederaSessionCaptured = true;
          LogService.logInfo("[HWC Modal] Captured hederaProvider.session");
        }
        if (injected && !this.injectedEip155Provider) {
          this.injectedEip155Provider = injected;
          LogService.logInfo("[HWC Modal] Captured activeInjectedProvider");
        }
        if (state.open === false) {
          LogService.logInfo(
            `[HWC Modal] Modal closed after ${stateChangeCount} state changes. ` +
              `hederaSessionCaptured=${this._hederaSessionCaptured} injectedCaptured=${!!this.injectedEip155Provider}`,
          );
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        }
      });
    });

    // Let provider settle after modal close
    await new Promise((r) => setTimeout(r, 300));

    const sessionAfter = this.hederaProvider?.session;
    const injectedAfter = (this.eip155Adapter as any)?.activeInjectedProvider;
    LogService.logInfo(
      `[HWC Modal] After 300ms settle: hederaSession=${!!sessionAfter} injectedProvider=${!!injectedAfter} ` +
        `_hederaSessionCaptured=${this._hederaSessionCaptured} _injectedCaptured=${!!this.injectedEip155Provider}`,
    );
    if (injectedAfter && !this.injectedEip155Provider) {
      this.injectedEip155Provider = injectedAfter;
      LogService.logInfo("[HWC Modal] Captured activeInjectedProvider after settle");
    }
    if (sessionAfter && !this._hederaSessionCaptured) {
      this._hederaSessionCaptured = true;
      LogService.logInfo("[HWC Modal] Captured hederaProvider.session after settle");
    }

    // Ensure native provider accounts are populated after session establishment
    this.ensureNativeProviderReady();
  }

  private async resolveAndCacheAccount(currentNetwork: string): Promise<void> {
    if (!this.hederaProvider) throw new NotInitialized();

    const hederaAccount = this.hederaProvider.getAccountAddresses()[0];
    if (!hederaAccount) throw new AccountNotFound();

    LogService.logInfo(`[HWC v2] Provided account: ${hederaAccount}`);

    let accountMirror;
    try {
      accountMirror = await this.mirrorNodeAdapter.getAccountInfo(hederaAccount);
      LogService.logInfo(`[HWC v2] Successfully retrieved account info from Mirror Node`);
    } catch (error) {
      const errorMessage = `Account ${hederaAccount} does not exist in ${currentNetwork}. Please create or import an account for this network in your wallet.`;
      LogService.logError(`[HWC v2] ${errorMessage}`);
      throw new Error(errorMessage);
    }

    if (!accountMirror || !accountMirror.id) {
      const errorMessage = `No valid account info from Mirror Node for ${hederaAccount} in ${currentNetwork}`;
      LogService.logError(`[HWC v2] ${errorMessage}`);
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
      data: { account: this.account, pairing: "", topic: "" },
      network: {
        name: this.networkService.environment,
        recognized: true,
        factoryId: this.networkService.configuration ? this.networkService.configuration.factoryAddress : "",
        resolverId: this.networkService.configuration?.resolverAddress ?? "",
      },
    };
    this.eventService.emit(WalletEvents.walletPaired, eventData);
  }

  private async resolveAndCacheAccountFromInjected(currentNetwork: string): Promise<void> {
    if (!this.injectedEip155Provider) throw new Error("No injected EIP-1193 provider available");

    const accounts = (await (this.injectedEip155Provider as any).request({
      method: "eth_accounts",
    })) as string[];

    if (!accounts || accounts.length === 0) throw new Error("No accounts returned from MetaMask");

    const evmAddress = accounts[0];
    LogService.logInfo(`[HWC Injected] EVM address from MetaMask: ${evmAddress}`);

    let accountMirror;
    try {
      accountMirror = await this.mirrorNodeAdapter.getAccountInfo(evmAddress);
    } catch (error) {
      throw new Error(
        `No Hedera account found for EVM address ${evmAddress} on ${currentNetwork}. ` +
          `Make sure your MetaMask account has a linked Hedera account on this network.`,
      );
    }

    if (!accountMirror?.id) {
      throw new Error(`No valid Hedera account for EVM address ${evmAddress} on ${currentNetwork}`);
    }

    this.account = new Account({
      id: accountMirror.id?.toString() ?? evmAddress,
      publicKey: accountMirror.publicKey,
      evmAddress: accountMirror.evmAddress || evmAddress,
    });
    this.network = currentNetwork;

    const eventData: WalletPairedEvent = {
      wallet: SupportedWallets.HWALLETCONNECT,
      data: { account: this.account, pairing: "", topic: "" },
      network: {
        name: this.network,
        recognized: true,
        factoryId: this.networkService.configuration?.factoryAddress ?? "",
        resolverId: this.networkService.configuration?.resolverAddress ?? "",
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
      if (!this._isConnecting) await this.stop();
    });

    this.hederaProvider.on("session_update", async (event: unknown) => {
      LogService.logInfo(`[HWC v2] Session updated: ${JSON.stringify(event)}`);
    });

    this.hederaProvider.on("disconnect", async () => {
      if (!this._isConnecting) await this.stop();
    });

    if (this.appKit) {
      this.appKit.subscribeState((state: unknown) => {
        LogService.logInfo(`[HWC] AppKit state: ${JSON.stringify(state)}`);
      });
    }
  }

  private ensureInitialized(): void {
    if (!this.hederaProvider) throw new NotInitialized();
    if (!this.account) throw new AccountNotSet();
  }

  /**
   * Ensures the native HIP-820 provider has accounts loaded.
   * After AppKit pairing, `initProviders()` may run before the session's
   * hedera namespace is fully populated, leaving the native provider with
   * an empty accounts list.  Re-running `initProviders()` picks up the
   * accounts from the now-populated session.
   */
  private ensureNativeProviderReady(): void {
    if (!this.hederaProvider) return;
    const native = this.hederaProvider.nativeProvider;
    if (native && (!native.namespace?.accounts || native.namespace.accounts.length === 0)) {
      LogService.logTrace("[HWC v2] Native provider has no accounts — reinitializing providers");
      this.hederaProvider.initProviders();
      this.patchInitProviders();
    }
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
    // EIP-1193 injected path (MetaMask extension, no WC session) is also EVM
    if (this.injectedEip155Provider) return true;
    return !this.hederaProvider?.session?.namespaces?.hedera;
  }

  private evmChainId(): "295" | "296" {
    return this.isTestnet() ? "296" : "295";
  }

  private currentEvmChainRef(): `eip155:${string}` {
    return `eip155:${this.evmChainId()}`;
  }

  private clearWalletConnectStorage(): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    const keysToRemove = Object.keys(window.localStorage).filter(
      (key) => key.startsWith("wc@") || key.startsWith("walletconnect"),
    );
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  }

  private rpcProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(this.networkService.rpcNode?.baseUrl);
  }

  private static readonly HEDERA_EVM_CHAINS = new Set(["eip155:295", "eip155:296"]);
  private static prototypePatched = false;

  /**
   * Patches `HederaProvider` prototype methods BEFORE any instance is created.
   *
   * Two methods need patching:
   *
   * 1. `initProviders` — called by `HederaProvider.init()`, `connect()`,
   *    `pair()` and the `rpcProviders` getter. Filters session accounts to
   *    Hedera-only chains so `EIP155Provider` doesn't throw for non-Hedera
   *    chains that MetaMask includes in the approved session.
   *
   * 2. `createProviders` — inherited from `UniversalProvider`, called during
   *    `checkStorage()` → `initialize()`. The parent's version creates its own
   *    EIP155 provider with the raw session chains and throws for non-Hedera
   *    chains. Since `HederaProvider` uses `initProviders` instead, we make
   *    `createProviders` a no-op.
   */
  private patchInitProvidersPrototype(): void {
    if (HederaWalletConnectTransactionAdapter.prototypePatched) return;
    if (!HederaProvider?.prototype) return;

    const hederaChains = HederaWalletConnectTransactionAdapter.HEDERA_EVM_CHAINS;

    // Patch initProviders — filter session to Hedera EVM chains only
    if (HederaProvider.prototype.initProviders) {
      const origInit = HederaProvider.prototype.initProviders;

      HederaProvider.prototype.initProviders = function (this: any) {
        const sessionEip155 = this.session?.namespaces?.eip155;

        if (sessionEip155?.accounts?.length) {
          const original = sessionEip155.accounts as string[];
          const hederaOnly = original.filter((acc: string) => {
            const [ns, chainId] = acc.split(":");
            return hederaChains.has(`${ns}:${chainId}`);
          });

          if (hederaOnly.length > 0) {
            sessionEip155.accounts = hederaOnly;
            try {
              return origInit.call(this);
            } finally {
              sessionEip155.accounts = original;
            }
          }
        }

        return origInit.call(this);
      };
    }

    // Neutralise the parent UniversalProvider.createProviders() which is called
    // during checkStorage() and would throw for non-Hedera chains.
    // HederaProvider uses its own initProviders() instead.
    HederaProvider.prototype.createProviders = function () {};

    HederaWalletConnectTransactionAdapter.prototypePatched = true;
  }

  /**
   * Instance-level patch for `initProviders` — safety net for calls that
   * happen after `HederaProvider.init()` (e.g. `connect()`, `pair()`,
   * `rpcProviders` getter).
   */
  private patchInitProviders(): void {
    if (!this.hederaProvider) return;

    const provider = this.hederaProvider;
    const hederaChains = HederaWalletConnectTransactionAdapter.HEDERA_EVM_CHAINS;
    const orig = provider.initProviders.bind(provider);

    provider.initProviders = function (this: any) {
      const sessionEip155 = this.session?.namespaces?.eip155;

      if (!sessionEip155?.accounts?.length) {
        return orig();
      }

      const original = sessionEip155.accounts as string[];
      const hederaOnly = original.filter((acc: string) => {
        const [ns, chainId] = acc.split(":");
        return hederaChains.has(`${ns}:${chainId}`);
      });

      if (hederaOnly.length === 0) {
        return orig();
      }

      sessionEip155.accounts = hederaOnly;
      try {
        return orig();
      } finally {
        sessionEip155.accounts = original;
      }
    };
  }
}
