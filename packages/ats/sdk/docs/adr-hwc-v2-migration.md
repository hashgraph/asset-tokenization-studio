# ADR: Migrate to Hedera WalletConnect v2 and remove MetaMask integration

**Status:** Proposed

---

## Context

The ATS SDK currently integrates **Hedera WalletConnect (HWC) v1** (`@hashgraph/hedera-wallet-connect` v1.3.1) and a separate **MetaMask** adapter. We want to **migrate to HWC v2** and **remove the MetaMask integration entirely**, making WalletConnect the single wallet connection mechanism for web environments.

Wallets expose different capabilities:

- **`hedera` (HIP-820):** native Hedera signing/execution (e.g., HashPack).
- **`eip155` (EVM):** standard Ethereum-style RPC (e.g., Utila, MetaMask via WalletConnect).

### Current architecture

```
TransactionAdapter (abstract base, ~1700 lines)
├── HederaTransactionAdapter (abstract, ~30K lines)
│   ├── HederaWalletConnectTransactionAdapter  ← HWC v1, only HIP-820
│   └── CustodialTransactionAdapter
│       ├── DFNSTransactionAdapter
│       ├── FireblocksTransactionAdapter
│       └── AWSKMSTransactionAdapter
└── RPCTransactionAdapter (~3200 lines)  ← EVM, tightly coupled to MetaMask
```

Key files:

| Component         | Path                                                                               |
| ----------------- | ---------------------------------------------------------------------------------- |
| Base abstract     | `sdk/src/port/out/TransactionAdapter.ts`                                           |
| Hedera abstract   | `sdk/src/port/out/hs/HederaTransactionAdapter.ts`                                  |
| HWC v1 adapter    | `sdk/src/port/out/hs/hederawalletconnect/HederaWalletConnectTransactionAdapter.ts` |
| RPC adapter       | `sdk/src/port/out/rpc/RPCTransactionAdapter.ts`                                    |
| MetaMask service  | `sdk/src/app/service/wallet/metamask/MetamaskService.ts`                           |
| RPC response      | `sdk/src/port/out/rpc/RPCTransactionResponseAdapter.ts`                            |
| Hedera response   | `sdk/src/port/out/hs/HederaTransactionResponseAdapter.ts`                          |
| DI container      | `sdk/src/core/injectable/Injectable.ts`                                            |
| Wallet selection  | `sdk/src/app/service/transaction/TransactionService.ts`                            |
| Network facade    | `sdk/src/port/in/network/Network.ts`                                               |
| Supported wallets | `sdk/src/domain/context/network/Wallet.ts`                                         |

Today:

- **`HederaWalletConnectTransactionAdapter`** extends `HederaTransactionAdapter`, so every operation goes through HIP-820 (`hedera_signAndExecuteTransaction` via `DAppConnector`). This fails when the session has no approved `hedera` namespace.
- **`RPCTransactionAdapter`** handles EVM calls (`eth_*`) but is hardwired to MetaMask via `MetamaskService` and the global `ethereum` object (`@metamask/detect-provider`). It duplicates all ~80+ operations from the Hedera adapter.
- Both adapters duplicate every operation, one using `ContractExecuteTransaction` + Hedera SDK, the other using ethers.js contract factories.
- Response normalization is split: `HederaTransactionResponseAdapter` for HTS and `RPCTransactionResponseAdapter` for EVM — both already produce `TransactionResponse`.

---

## Problem

1. **Namespace mismatch.** Wallet sessions may approve only `eip155`, only `hedera`, or both. If `hedera` isn't approved, HIP-820 calls fail.
2. **No runtime routing.** There is no mechanism to choose between the HIP-820 and EVM paths based on the active session's namespaces.
3. **MetaMask is redundant.** With HWC v2 supporting `eip155`, MetaMask users can connect through WalletConnect. The dedicated `RPCTransactionAdapter` + `MetamaskService` (~3500 lines combined) becomes unnecessary.
4. **Massive duplication.** ~80+ operations are implemented independently in `HederaTransactionAdapter` (~30K lines) and `RPCTransactionAdapter` (~3200 lines). Removing the MetaMask adapter and unifying through WalletConnect eliminates this.

---

## Decision

### 1. Remove `RPCTransactionAdapter` and `MetamaskService`

Delete the MetaMask integration entirely:

- `sdk/src/port/out/rpc/RPCTransactionAdapter.ts` (~3200 lines)
- `sdk/src/app/service/wallet/metamask/MetamaskService.ts` (~290 lines)
- Remove `SupportedWallets.METAMASK` from the enum
- Remove MetaMask case from `TransactionService.getHandlerClass()`
- Remove MetaMask registration from `Injectable.registerTransactionAdapterInstances()`
- Remove MetaMask-specific logic from `Network.init()` (the `setConfig` call for `mirrorNodes`, `jsonRpcRelays`, `factories`, `resolvers`)
- Remove `@metamask/detect-provider` dependency

MetaMask users can still connect via WalletConnect's `eip155` namespace — they just use the WalletConnect modal instead of the injected provider.

### 2. Replace the HWC v1 adapter with a new `HederaWalletConnectTransactionAdapter` that extends `TransactionAdapter` directly

The new adapter uses the HWC v2 stack (`HederaProvider`, `HederaAdapter`, `createAppKit` from `@reown/appkit`) and implements **all operations itself**, routing each through a private `performOperation` method that selects HIP-820 or EVM at runtime.

The adapter no longer extends `HederaTransactionAdapter` — it extends `TransactionAdapter` directly.

### 3. Request both namespaces as optional during session creation

During initialization, the adapter requests both `hedera` and `eip155` as **optional namespaces**. This lets the wallet approve whichever it supports:

```typescript
const providerOpts = {
  projectId: this.projectId,
  metadata: this.dappMetadata,
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
      chains: hederaChains, // e.g. ['hedera:testnet', 'hedera:mainnet']
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
      chains: eip155Chains, // e.g. ['eip155:296', 'eip155:295']
      events: ["chainChanged", "accountsChanged"],
      rpcMap: {
        "eip155:296": rpcUrl,
        "eip155:295": rpcUrl,
      },
    },
  },
};

this.hederaProvider = await HederaProvider.init(providerOpts);
```

### 4. Route operations at runtime based on approved session namespaces and account key type

Each operation (pause, mint, etc.) builds a descriptor and delegates to a private `performOperation` that checks the session:

```typescript
private isEvmSession(): boolean {
  return !this.hederaProvider?.session?.namespaces?.hedera;
}
```

Routing rules:

- **If `hedera` is approved** → HIP-820 path: encode function data, build `ContractExecuteTransaction`, sign and execute via `hedera_signAndExecuteTransaction` through `HederaProvider`, normalize with `HederaTransactionResponseAdapter`.
- **If only `eip155` is approved** → EVM path: encode function data, send via `eth_sendTransaction` through `HederaProvider.request()`, wait for receipt via JSON-RPC, normalize with `RPCTransactionResponseAdapter`.
- **If neither** → fail fast with a clear error.

#### Account key type constraints

The two execution paths have different key type requirements:

| Path               | Method                             |    ECDSA (secp256k1)    |                  ED25519                   |
| ------------------ | ---------------------------------- | :---------------------: | :----------------------------------------: |
| EVM (`eip155`)     | `eth_sendTransaction`              |           Yes           | **No** — cannot produce an ECDSA signature |
| HIP-820 (`hedera`) | `hedera_signAndExecuteTransaction` | Yes (at protocol level) |                    Yes                     |

Key implications:

- **ED25519 accounts can only use the HIP-820 path.** The EVM path requires an Ethereum-compatible (ECDSA) signature, which ED25519 keys cannot produce. This is a hard protocol constraint.
- **ECDSA accounts can use either path.** The Hedera SDK supports ECDSA at the protocol level, so `hedera_signAndExecuteTransaction` works with ECDSA accounts in principle.
- **The namespace acts as a safe proxy.** If a wallet only approves `eip155`, the connected account is necessarily ECDSA (otherwise EVM operations would fail). If a wallet approves `hedera`, it's claiming it can handle HIP-820 for whatever key type the account uses.

#### Why two paths are necessary (wallet method handling)

A key architectural constraint: **the wallet controls how each method is processed, not the dApp**.

When the dApp calls `hederaProvider.request({ method: 'eth_sendTransaction', params: [...] })`:

1. The request is sent to the connected wallet (e.g., Utila)
2. **The wallet** handles the method using its internal EVM logic
3. **The wallet** signs and submits the transaction
4. The dApp just waits for the response

The dApp cannot "implement `eth_sendTransaction` using Hedera SDK" because it doesn't control what happens when the wallet receives the request. The wallet is the signer and submitter.

This means:

- `hedera_signAndExecuteTransaction` → wallet must implement HIP-820 internally
- `eth_sendTransaction` → wallet must implement EVM/JSON-RPC internally

**You cannot mix them.** An EVM wallet (Utila) that only approves `eip155` will reject `hedera_*` methods as unknown. A Hedera wallet (HashPack) that only approves `hedera` will reject `eth_*` methods.

**Alternative considered and rejected:** Configure `hedera_*` methods under the `eip155` namespace. This doesn't work because:

- The namespace tells the wallet what protocol/methods you're requesting
- EVM wallets don't implement `hedera_*` methods regardless of which namespace they're listed under
- It's like asking a Spanish speaker to understand Japanese by labeling your Japanese text as "Spanish"

**Consequence:** To support both Hedera-native wallets (HashPack) and EVM-only wallets (Utila), dual paths are required:

- HIP-820 path: Hedera SDK builds `ContractExecuteTransaction`, sent via `hedera_signAndExecuteTransaction`
- EVM path: ethers.js encodes the call, sent via `eth_sendTransaction`

**Simplification option:** Start with HIP-820 only. This supports HashPack and other Hedera wallets (both ED25519 and ECDSA accounts). EVM-only wallets like Utila won't work initially. The EVM path can be added later.

#### Open questions

- **Do EVM-only wallets (e.g., Utila) ever approve the `hedera` namespace?** If not, the routing is straightforward — they always go through the EVM path with ECDSA accounts.
- **Do Hedera-native wallets (e.g., HashPack) correctly handle `hedera_signAndExecuteTransaction` for ECDSA accounts?** At the protocol level this should work, but it depends on the wallet's WalletConnect implementation. If a wallet approves `hedera` but only handles ED25519, ECDSA accounts would fail on the HIP-820 path.
- **When HashPack approves both namespaces with an ECDSA account, should we prefer EVM or HIP-820?** The current routing prefers HIP-820 (checks `hedera` first). If wallet support for ECDSA over HIP-820 is unreliable, we could refine the routing to also check the account key type and prefer EVM for ECDSA accounts even when `hedera` is available.

These questions should be validated during Phase 2 testing.

### 5. Connection flow uses AppKit modal

Replace `DAppConnector` + `dAppConnector.openModal()` with the Reown AppKit stack:

```typescript
public async connectWalletConnect(network?: string): Promise<string> {
  const currentNetwork = network ?? this.networkService.environment;

  await this.initAdaptersAndProvider(currentNetwork);
  await this.openPairingModal();
  await this.resolveAndCacheAccount(currentNetwork);
  this.subscribe();

  return currentNetwork;
}
```

Where `initAdaptersAndProvider` creates `HederaAdapter` instances for both native and eip155, initializes `HederaProvider`, and creates the `AppKit` with `createAppKit()`.

### 6. Update DI and wallet selection to reflect MetaMask removal

| What                                               | Change                                                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `SupportedWallets` enum                            | Remove `METAMASK`. Keep `HWALLETCONNECT`.                                                                                            |
| `TransactionService.getHandlerClass()`             | Remove `METAMASK` case. `HWALLETCONNECT` already resolves `HederaWalletConnectTransactionAdapter`.                                   |
| `Injectable.registerTransactionAdapterInstances()` | Remove `RPCTransactionAdapter` registration. Keep `HederaWalletConnectTransactionAdapter`.                                           |
| `Network.init()`                                   | Remove MetaMask-specific `setConfig` call and `RPCTransactionAdapter` import.                                                        |
| `ConnectRequest`                                   | Remove MetaMask-related fields/options.                                                                                              |
| `HWCSettings`                                      | No change — existing fields (`projectId`, `dappName`, `dappDescription`, `dappURL`, `dappIcons`) already align with AppKit metadata. |

---

## Architecture diagram

### Before (current)

```
TransactionAdapter (abstract base)
├── HederaTransactionAdapter (abstract, ~30K lines)
│   ├── HederaWalletConnectTransactionAdapter  ← HWC v1, hedera only
│   └── CustodialTransactionAdapter
│       ├── DFNSTransactionAdapter
│       ├── FireblocksTransactionAdapter
│       └── AWSKMSTransactionAdapter
└── RPCTransactionAdapter (~3200 lines)  ← MetaMask only   ◄── REMOVED
      └── MetamaskService (~290 lines)                      ◄── REMOVED
```

### After

```
TransactionAdapter (abstract base)
├── HederaTransactionAdapter (abstract — unchanged, serves custodial adapters)
│   └── CustodialTransactionAdapter
│       ├── DFNSTransactionAdapter
│       ├── FireblocksTransactionAdapter
│       └── AWSKMSTransactionAdapter
│
└── HederaWalletConnectTransactionAdapter (NEW — replaces both HWC v1 and MetaMask)
     │
     ├── HederaProvider (from @reown/appkit)
     │   ├── optionalNamespaces.hedera  ──► HIP-820 path
     │   └── optionalNamespaces.eip155  ──► EVM path (covers MetaMask via WalletConnect)
     │
     └── performOperation(proxyAddress, iface, method, args, gas)
          │
          ├── isEvmSession() == false  (hedera namespace approved)
          │   → ContractExecuteTransaction + hedera_signAndExecuteTransaction
          │   → HederaTransactionResponseAdapter.manageResponse()
          │
          └── isEvmSession() == true   (eip155 namespace only)
              → iface.encodeFunctionData() + eth_sendTransaction
              → RPCTransactionResponseAdapter.manageResponse()
```

---

## Implementation sketch

### Adapter skeleton

```typescript
@singleton()
export class HederaWalletConnectTransactionAdapter extends TransactionAdapter {
  public account!: Account;
  protected network!: Environment;
  protected projectId = "";
  protected hederaAdapter: InstanceType<typeof HederaAdapter> | undefined;
  protected appKit: any;
  protected hederaProvider: InstanceType<typeof HederaProvider> | undefined;
  protected dappMetadata: SignClientTypes.Metadata = {
    name: "",
    description: "",
    url: "",
    icons: [],
  };

  constructor(
    @lazyInject(EventService) private readonly eventService: EventService,
    @lazyInject(NetworkService) protected readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter) protected readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {
    super();
  }

  // ── Lifecycle ────────────────────────────────────────────

  public async init(network?: NetworkName): Promise<string> {
    const currentNetwork = network ?? this.networkService.environment;
    this.eventService.emit(WalletEvents.walletInit, {
      initData: { account: this.account, pairing: "", topic: "" },
      wallet: SupportedWallets.HWALLETCONNECT,
    });
    return currentNetwork;
  }

  public async register(hwcSettings: HWCSettings): Promise<InitializationData> {
    Injectable.registerTransactionHandler(this);
    if (!hwcSettings) throw new NoSettings();

    this.projectId = hwcSettings.projectId ?? "";
    this.dappMetadata = {
      name: hwcSettings.dappName ?? "",
      description: hwcSettings.dappDescription ?? "",
      url: hwcSettings.dappURL ?? "",
      icons: hwcSettings.dappIcons ?? [],
    };

    await this.connectWalletConnect();
    return { account: this.getAccount() };
  }

  public async connectWalletConnect(network?: string): Promise<string> {
    const currentNetwork = network ?? this.networkService.environment;
    await this.initAdaptersAndProvider(currentNetwork);
    await this.openPairingModal();
    await this.resolveAndCacheAccount(currentNetwork);
    this.subscribe();
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
      return true;
    } catch (error: any) {
      const msg = String(error?.message ?? error);
      if (msg.includes("No active session") || msg.includes("No matching key")) {
        LogService.logInfo("No active WalletConnect session");
      } else {
        LogService.logError(`Error stopping HWC: ${msg}`);
      }
      return false;
    }
  }

  // ── Internal: connection plumbing ────────────────────────

  private async initAdaptersAndProvider(currentNetwork: string): Promise<void> {
    const isTestnet = currentNetwork === testnet;
    const nativeNetworks = isTestnet
      ? [HederaChainDefinition.Native.Testnet, HederaChainDefinition.Native.Mainnet]
      : [HederaChainDefinition.Native.Mainnet, HederaChainDefinition.Native.Testnet];
    const evmNetworks = isTestnet
      ? [HederaChainDefinition.EVM.Testnet, HederaChainDefinition.EVM.Mainnet]
      : [HederaChainDefinition.EVM.Mainnet, HederaChainDefinition.EVM.Testnet];

    this.hederaAdapter = new HederaAdapter({
      projectId: this.projectId,
      networks: nativeNetworks,
      namespace: "hedera",
    });
    const eip155Adapter = new HederaAdapter({
      projectId: this.projectId,
      networks: evmNetworks,
      namespace: "eip155",
    });

    const rpcUrl =
      this.networkService.rpcNode?.baseUrl ||
      (isTestnet ? "https://testnet.hashio.io/api" : "https://mainnet.hashio.io/api");
    const eip155Chains = isTestnet ? ["eip155:296", "eip155:295"] : ["eip155:295", "eip155:296"];
    const hederaChains = isTestnet ? ["hedera:testnet", "hedera:mainnet"] : ["hedera:mainnet", "hedera:testnet"];

    this.hederaProvider = await HederaProvider.init({
      projectId: this.projectId,
      metadata: this.dappMetadata,
      logger: "error",
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
            "eip155:296": isTestnet ? rpcUrl : "https://testnet.hashio.io/api",
            "eip155:295": !isTestnet ? rpcUrl : "https://mainnet.hashio.io/api",
          },
        },
      },
    });

    this.appKit = createAppKit({
      adapters: [this.hederaAdapter, eip155Adapter],
      universalProvider: this.hederaProvider,
      projectId: this.projectId,
      metadata: this.dappMetadata,
      networks: [
        HederaChainDefinition.Native.Testnet,
        HederaChainDefinition.Native.Mainnet,
        HederaChainDefinition.EVM.Testnet,
        HederaChainDefinition.EVM.Mainnet,
      ],
      features: { analytics: true, socials: false, swaps: false, onramp: false, email: false },
    });
  }

  private async openPairingModal(): Promise<void> {
    if (!this.appKit) throw new NotInitialized();
    await this.appKit.open();
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error("Connection timeout"));
      }, 300_000);
      const unsubscribe = this.appKit.subscribeState((state: any) => {
        if (!state.open) {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        }
      });
    });
    await new Promise((r) => setTimeout(r, 300)); // let provider settle
  }

  private async resolveAndCacheAccount(currentNetwork: string): Promise<void> {
    if (!this.hederaProvider) throw new NotInitialized();
    const hederaAccount = this.hederaProvider.getAccountAddresses()[0];
    if (!hederaAccount) throw new AccountNotRetrievedFromSigners();

    const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(hederaAccount);
    if (!accountMirror) throw new AccountNotFound();

    this.account = new Account({
      id: accountMirror.id!.toString(),
      publicKey: accountMirror.publicKey,
      evmAddress: accountMirror.evmAddress,
    });
    this.network = currentNetwork;

    this.eventService.emit(WalletEvents.walletPaired, {
      wallet: SupportedWallets.HWALLETCONNECT,
      data: { account: this.account, pairing: "", topic: "" },
      network: {
        name: this.network,
        recognized: true,
        factoryId: this.networkService.configuration?.factoryAddress || "",
      },
    });
  }

  public subscribe(): void {
    if (!this.hederaProvider) return;
    this.hederaProvider.on("session_delete", () => this.stop());
    this.hederaProvider.on("disconnect", () => this.stop());
    this.hederaProvider.on("session_update", (event: unknown) => {
      LogService.logInfo(`HWC session updated: ${JSON.stringify(event)}`);
    });
  }

  // ── Dual-path execution core ─────────────────────────────

  private isEvmSession(): boolean {
    return !this.hederaProvider?.session?.namespaces?.hedera;
  }

  private evmChainId(): "295" | "296" {
    return this.networkService.environment === testnet ? "296" : "295";
  }

  private currentEvmChainRef(): `eip155:${string}` {
    return `eip155:${this.evmChainId()}`;
  }

  private rpcProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(this.networkService.rpcNode?.baseUrl);
  }

  /**
   * Central execution method. Routes to EVM or HIP-820 based on session namespaces.
   */
  private async performOperation(
    proxyAddress: string,
    iface: ethers.Interface,
    functionName: string,
    params: any[],
    gasLimit: number,
    responseOptions?: { eventName: string; contract: ethers.BaseContract },
  ): Promise<TransactionResponse> {
    this.ensureInitialized();

    if (this.isEvmSession()) {
      return this.performEvmOperation(proxyAddress, iface, functionName, params, gasLimit, responseOptions);
    } else {
      return this.performHederaOperation(proxyAddress, iface, functionName, params, gasLimit);
    }
  }

  /**
   * EVM path — eth_sendTransaction via HederaProvider.
   */
  private async performEvmOperation(
    proxyAddress: string,
    iface: ethers.Interface,
    functionName: string,
    params: any[],
    gasLimit: number,
    responseOptions?: { eventName: string; contract: ethers.BaseContract },
  ): Promise<TransactionResponse> {
    if (!this.account.evmAddress) throw new Error("Account EVM address is not set");

    const data = iface.encodeFunctionData(functionName, params);
    const chainRef = this.currentEvmChainRef();

    const txParams: any = {
      from: this.account.evmAddress,
      to: proxyAddress,
      data,
      gas: ethers.toBeHex(gasLimit),
    };

    const txHash = await this.hederaProvider!.request({ method: "eth_sendTransaction", params: [txParams] }, chainRef);
    const provider = this.rpcProvider();
    const receipt = await provider.waitForTransaction(txHash as string);

    const responsePayload = { hash: txHash, wait: () => Promise.resolve(receipt) } as any;
    return RPCTransactionResponseAdapter.manageResponse(
      responsePayload,
      this.networkService.environment,
      responseOptions?.eventName,
    );
  }

  /**
   * HIP-820 path — ContractExecuteTransaction via hedera_signAndExecuteTransaction.
   *
   * Reuses the encoding pattern from HederaTransactionAdapter.executeWithArgs:
   * encode the function call with ethers, convert to bytes, set as function parameters
   * on a ContractExecuteTransaction, then sign+execute via the HederaProvider.
   */
  private async performHederaOperation(
    proxyAddress: string,
    iface: ethers.Interface,
    functionName: string,
    params: any[],
    gasLimit: number,
  ): Promise<TransactionResponse> {
    const contractId = await this.resolveContractId(proxyAddress);
    const encodedHex = iface.encodeFunctionData(functionName, params);
    const encoded = new Uint8Array(Buffer.from(encodedHex.slice(2), "hex"));

    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(gasLimit)
      .setFunctionParameters(encoded);

    if (!tx.isFrozen()) {
      tx._freezeWithAccountId(AccountId.fromString(this.account.id.toString()));
    }

    const txBase64 = transactionToBase64String(tx as any);
    const chainId = this.networkService.environment === testnet ? HederaChainId.Testnet : HederaChainId.Mainnet;

    const result = await this.hederaProvider!.request({
      method: "hedera_signAndExecuteTransaction",
      params: {
        transactionList: txBase64,
        signerAccountId: `${chainId}:${this.account.id.toString()}`,
      },
    });

    const transactionResponse = HTransactionResponse.fromJSON(result as any);
    return HederaTransactionResponseAdapter.manageResponse(
      this.networkService.environment,
      /* signer */ undefined as any, // HWC v2 provider handles signing internally
      transactionResponse,
    );
  }

  /**
   * Resolves an EVM proxy address to a Hedera ContractId via mirror node.
   */
  private async resolveContractId(evmAddress: string): Promise<ContractId> {
    const info = await this.mirrorNodeAdapter.getContractInfo(evmAddress);
    return ContractId.fromString(info.contractId);
  }

  private ensureInitialized(): void {
    if (!this.hederaProvider) throw new NotInitialized();
    if (!this.account) throw new AccountNotSet();
  }

  // ── Operations ───────────────────────────────────────────
  // Each operation builds the ABI call and delegates to performOperation.

  async pause(security: EvmAddress): Promise<TransactionResponse> {
    return this.performOperation(
      security.toString(),
      new ethers.Interface(PauseFacet__factory.abi),
      "pause",
      [],
      GAS.PAUSE,
    );
  }

  async unpause(security: EvmAddress): Promise<TransactionResponse> {
    return this.performOperation(
      security.toString(),
      new ethers.Interface(PauseFacet__factory.abi),
      "unpause",
      [],
      GAS.UNPAUSE,
    );
  }

  async mint(security: EvmAddress, target: EvmAddress, amount: BigDecimal): Promise<TransactionResponse> {
    return this.performOperation(
      security.toString(),
      new ethers.Interface(ERC3643OperationsFacet__factory.abi),
      "mint",
      [target.toString(), amount.toBigNumber()],
      GAS.MINT,
    );
  }

  async burn(source: EvmAddress, security: EvmAddress, amount: BigDecimal): Promise<TransactionResponse> {
    return this.performOperation(
      security.toString(),
      new ethers.Interface(ERC3643OperationsFacet__factory.abi),
      "burn",
      [source.toString(), amount.toBigNumber()],
      GAS.BURN,
    );
  }

  async transfer(security: EvmAddress, targetId: EvmAddress, amount: BigDecimal): Promise<TransactionResponse> {
    return this.performOperation(
      security.toString(),
      new ethers.Interface(ERC1410TokenHolderFacet__factory.abi),
      "transferByPartition",
      [_PARTITION_ID_1, { to: targetId.toString(), value: amount.toBigNumber() }, "0x"],
      GAS.TRANSFER,
    );
  }

  // ... remaining ~75 operations follow the same pattern
}
```

---

## Migration plan (incremental, safe steps)

### Phase 1 — Remove MetaMask integration

1. Remove `SupportedWallets.METAMASK` from `sdk/src/domain/context/network/Wallet.ts`.
2. Remove `RPCTransactionAdapter` from:
   - `TransactionService.getHandlerClass()` (`sdk/src/app/service/transaction/TransactionService.ts`)
   - `Injectable.registerTransactionAdapterInstances()` (`sdk/src/core/injectable/Injectable.ts`)
   - `Network.init()` (`sdk/src/port/in/network/Network.ts`) — remove the `RPCTransactionAdapter` instanceof check and `setConfig` call
3. Delete `sdk/src/port/out/rpc/RPCTransactionAdapter.ts`.
4. Delete `sdk/src/app/service/wallet/metamask/MetamaskService.ts`.
5. Remove `@metamask/detect-provider` and `@metamask/providers` from `package.json`.
6. Update `ConnectRequest` to remove MetaMask-specific options.
7. Keep `RPCTransactionResponseAdapter` — the new HWC v2 adapter's EVM path will reuse it.

### Phase 2 — Scaffold HWC v2 adapter and validate with one operation

8. Add `@reown/appkit` and upgrade `@hashgraph/hedera-wallet-connect` to v2.
9. Rewrite `HederaWalletConnectTransactionAdapter` to extend `TransactionAdapter` directly, with the new `HederaProvider` + `AppKit` connection flow.
10. Implement `performOperation` with dual EVM/HIP-820 routing.
11. Migrate **one operation** (`pause`) end-to-end.
12. Test against a wallet that approves only `eip155` (e.g., Utila) and one that approves `hedera` (e.g., HashPack).

### Phase 3 — Gradual operation migration

13. Migrate remaining operations in batches (5-10 per PR):
    - Token lifecycle: `mint`, `burn`, `transfer`, `forcedTransfer`, `controllerTransfer`, `controllerRedeem`, `issue`, `redeem`
    - Factory: `createEquity`, `createBond`
    - Access control: `grantRole`, `revokeRole`, `authorizeOperator`, `revokeOperator`
    - Equity: `setDividends`, `setVotingRights`, `setScheduledBalanceAdjustment`
    - Bond: `setCoupon`, `updateMaturityDate`, `redeemAtMaturityByPartition`
    - Documents: `setDocument`, `removeDocument`
    - Snapshots: `takeSnapshot`, `triggerScheduledSnapshots`
    - Lock/Hold: `lock`, `release`, `transferAndLock`
    - Clearing, Freeze, KYC, SSI, ControlList, Compliance, Batch operations
14. Each batch includes tests verifying both HIP-820 and EVM paths.

### Phase 4 — Cleanup

15. Remove old HWC v1 dependency (`@hashgraph/hedera-wallet-connect` v1.3.1).
16. Remove `DAppConnector`, old `HederaChainId` imports, and related v1 code.
17. Remove any dead code in `HederaTransactionAdapter` that was only used by the old HWC adapter (the class itself stays as base for custodial adapters).
18. Clean up any remaining MetaMask references in tests, web app stores, and documentation.

---

## Consequences

### Positive

- **Dual namespace support.** The adapter works with wallets that approve `hedera`, `eip155`, or both — no more silent failures.
- **Single operation definition.** Each operation is written once in the new adapter. The dual routing is handled centrally in `performOperation`.
- **MetaMask still works.** MetaMask users connect via WalletConnect's `eip155` namespace through the AppKit modal. No dedicated adapter or injected provider needed.
- **~3500 lines removed.** Deleting `RPCTransactionAdapter` (~3200 lines) and `MetamaskService` (~290 lines) eliminates the largest source of duplication.
- **Fewer dependencies.** `@metamask/detect-provider` and `@metamask/providers` are removed.
- **Reuses validated response adapters.** HIP-820 path normalizes via `HederaTransactionResponseAdapter`, EVM path via `RPCTransactionResponseAdapter` — both already battle-tested.
- **Minimal DI changes.** The adapter keeps the same class name (`HederaWalletConnectTransactionAdapter`) and `SupportedWallets.HWALLETCONNECT` value. Only the `METAMASK` case and `RPCTransactionAdapter` registration are removed.
- **Incremental.** Phase 1 removes MetaMask cleanly. Phase 2 scaffolds the new adapter with one operation. Each subsequent phase adds operations without changing the routing core.

### Negative / Risks

- **~80 operations to migrate.** Each must be re-implemented against the new `performOperation` signature. The operations themselves are thin (ABI + args + gas), but the volume is significant.
- **HIP-820 path needs `ContractId`.** The HIP-820 path requires a Hedera `ContractId`, not just an EVM address. This means `resolveContractId` does a mirror node lookup per operation when using the `hedera` namespace. This can be mitigated with caching.
- **`HederaTransactionResponseAdapter.manageResponse` expects a `Signer`.** The HIP-820 path via `HederaProvider` handles signing internally, so the signer parameter needs adaptation (the current v1 adapter passes the `DAppConnector` signer).
- **AppKit bundle size.** `@reown/appkit` adds modal UI and WalletConnect client code to the bundle, though it replaces the MetaMask provider detection code.
- **Testing overhead.** Each migrated operation needs verification on both namespace paths.
- **Breaking change for SDK consumers using `SupportedWallets.METAMASK`.** Consumers must update to `SupportedWallets.HWALLETCONNECT` — MetaMask users connect through the WalletConnect modal instead.

### Impact on existing code

| Component                                      | Impact                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `RPCTransactionAdapter`                        | **Deleted.**                                                                                           |
| `MetamaskService`                              | **Deleted.**                                                                                           |
| `RPCTransactionResponseAdapter`                | **Kept.** Reused by the new adapter's EVM path.                                                        |
| `HederaWalletConnectTransactionAdapter`        | **Replaced in-place.** Same class name, new internals. No longer extends `HederaTransactionAdapter`.   |
| `HederaTransactionAdapter`                     | **Unchanged.** Still serves as base for custodial adapters.                                            |
| Custodial adapters (DFNS, Fireblocks, AWS KMS) | **Unchanged.** They extend `HederaTransactionAdapter` which is unaffected.                             |
| `SupportedWallets` enum                        | `METAMASK` removed. `HWALLETCONNECT` remains.                                                          |
| `TransactionService`                           | `METAMASK` case removed.                                                                               |
| `Injectable`                                   | `RPCTransactionAdapter` removed from registration.                                                     |
| `Network`                                      | MetaMask-specific `setConfig` and instanceof check removed.                                            |
| Web app (`apps/ats/web/`)                      | Wallet selection UI must be updated to remove MetaMask option. WalletConnect modal covers all wallets. |
