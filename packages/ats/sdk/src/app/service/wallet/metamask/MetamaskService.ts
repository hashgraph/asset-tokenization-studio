// SPDX-License-Identifier: Apache-2.0

import { SetConfigurationCommand } from "@command/network/setConfiguration/SetConfigurationCommand";
import { SetNetworkCommand } from "@command/network/setNetwork/SetNetworkCommand";
import { CommandBus } from "@core/command/CommandBus";
import { RuntimeError } from "@core/error/RuntimeError";
import Account from "@domain/context/account/Account";
import { EnvironmentFactory, Factories } from "@domain/context/factory/Factories";
import { EnvironmentResolver, Resolvers } from "@domain/context/factory/Resolvers";
import { HederaNetworks, unrecognized } from "@domain/context/network/Environment";
import { WalletConnectError } from "@domain/context/network/error/WalletConnectError";
import { WalletConnectRejectedError } from "@domain/context/network/error/WalletConnectRejectedError";
import { EnvironmentJsonRpcRelay, JsonRpcRelay, JsonRpcRelays } from "@domain/context/network/JsonRpcRelay";
import { EnvironmentMirrorNode, MirrorNode, MirrorNodes } from "@domain/context/network/MirrorNode";
import detectEthereumProvider from "@metamask/detect-provider";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import EventService from "@service/event/EventService";
import LogService from "@service/log/LogService";
import { Signer, ethers } from "ethers";
import type { Provider } from "@ethersproject/providers";
import Injectable from "@core/injectable/Injectable";
import TransactionAdapter, { InitializationData } from "@port/out/TransactionAdapter";
import NetworkService from "@service/network/NetworkService";
import { singleton } from "tsyringe";
import Service from "@service/Service";
import { SupportedWallets } from "@domain/context/network/Wallet";
import { ConnectionState, WalletEvents } from "@service/event/WalletEvent";

declare const ethereum: MetaMaskInpageProvider;

@singleton()
export default class MetamaskService extends Service {
  private signerOrProvider: Signer | Provider;
  private account: Account;
  private factories: Factories;
  private resolvers: Resolvers;
  private mirrorNodes: MirrorNodes;
  private jsonRpcRelays: JsonRpcRelays;
  private eventService: EventService;
  private commandBus: CommandBus;
  private networkService: NetworkService;
  private mirrorNodeAdapter: MirrorNodeAdapter;

  constructor(
    eventService: EventService,
    commandBus: CommandBus,
    networkService: NetworkService,
    mirrorNodeAdapter: MirrorNodeAdapter,
  ) {
    super();
    this.eventService = eventService;
    this.commandBus = commandBus;
    this.networkService = networkService;
    this.mirrorNodeAdapter = mirrorNodeAdapter;
  }

  async init(debug = false): Promise<string> {
    !debug && (await this.connectMetamask(false));
    const eventData = {
      initData: { account: this.account, pairing: "", topic: "" },
      wallet: SupportedWallets.METAMASK,
    };
    this.eventService.emit(WalletEvents.walletInit, eventData);
    LogService.logTrace("Metamask Initialized ", eventData);
    return this.networkService.environment;
  }

  async register(handler: TransactionAdapter, account?: Account, debug = false): Promise<InitializationData> {
    if (account) {
      const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(account.id);
      this.account = account;
      this.account.publicKey = accountMirror.publicKey;
    }
    Injectable.registerTransactionHandler(handler);
    !debug && (await this.connectMetamask());
    LogService.logTrace("Metamask registered as handler");
    return Promise.resolve({ account });
  }

  async stop(): Promise<boolean> {
    this.eventService.emit(WalletEvents.walletConnectionStatusChanged, {
      status: ConnectionState.Disconnected,
      wallet: SupportedWallets.METAMASK,
    });
    LogService.logTrace("Metamask stopped");
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.METAMASK,
    });
    return Promise.resolve(true);
  }

  async connectMetamask(pair = true): Promise<void> {
    try {
      const ethProvider = await detectEthereumProvider({ silent: true });
      if (!ethProvider || !ethProvider.isMetaMask) throw new WalletConnectError("Metamask was not found!");
      if (!ethereum.isConnected()) throw new WalletConnectError("Metamask is not connected!");
      this.eventService.emit(WalletEvents.walletFound, {
        wallet: SupportedWallets.METAMASK,
        name: SupportedWallets.METAMASK,
      });
      pair && (await this.pairWallet());
      this.signerOrProvider = new ethers.providers.Web3Provider(
        //@ts-expect-error No TS compatibility
        ethereum,
      ).getSigner();
    } catch (error: any) {
      if ("code" in error && error.code === 4001) throw new WalletConnectRejectedError(SupportedWallets.METAMASK);
      if (error instanceof WalletConnectError) throw error;
      throw new RuntimeError((error as Error).message);
    }
  }

  public getSignerOrProvider(): Signer | Provider {
    return this.signerOrProvider;
  }

  public setSignerOrProvider(setSignerOrProvider: Signer | Provider): void {
    this.signerOrProvider = setSignerOrProvider;
  }

  public getAccount(): Account {
    return this.account;
  }

  public setConfig(config: {
    mirrorNodes?: MirrorNodes;
    jsonRpcRelays?: JsonRpcRelays;
    factories?: Factories;
    resolvers?: Resolvers;
  }): void {
    if (config.mirrorNodes) this.mirrorNodes = config.mirrorNodes;
    if (config.jsonRpcRelays) this.jsonRpcRelays = config.jsonRpcRelays;
    if (config.factories) this.factories = config.factories;
    if (config.resolvers) this.resolvers = config.resolvers;
  }

  public registerMetamaskEvents(): void {
    if (
      typeof globalThis === "undefined" ||
      typeof (globalThis as any).window === "undefined" ||
      !((globalThis as any).window as any)?.ethereum
    )
      return;
    try {
      const ethereum = ((globalThis as any).window as any).ethereum;
      ethereum.on("accountsChanged", async (acct: unknown) => {
        const accounts = acct as string[];
        if (accounts.length === 0) {
          LogService.logTrace("Metamask disconnected from the wallet");
          this.eventService.emit(WalletEvents.walletDisconnect, {
            wallet: SupportedWallets.METAMASK,
          });
        } else if (!this.account || accounts[0] !== this.account.evmAddress) {
          await this.setMetasmaskAccount(accounts[0]);
          this.emitWalletPairedEvent();
        }
      });
      ethereum.on("chainChanged", async (chainId: unknown) => {
        await this.setMetamaskNetwork(chainId as string);
        const evmAddress = this.account?.evmAddress ?? (await this.getFirstAccount()) ?? "";
        await this.setMetasmaskAccount(evmAddress);
        this.emitWalletPairedEvent();
      });
    } catch (error) {
      LogService.logError(error);
      throw new WalletConnectError("Ethereum is not defined");
    }
  }

  private async pairWallet(): Promise<void> {
    const accts = await ethereum.request({ method: "eth_requestAccounts" });
    if (accts && "length" in accts && (accts as string[]).length > 0) {
      const evmAddress = (accts as string[])[0];
      const chainId = await ethereum.request({ method: "eth_chainId" });
      await this.setMetamaskNetwork(chainId);
      await this.setMetasmaskAccount(evmAddress);
      this.eventService.emit(WalletEvents.walletPaired, {
        data: { account: this.account, pairing: "", topic: "" },
        network: {
          name: this.networkService.environment,
          recognized: this.networkService.environment !== unrecognized,
          factoryId: this.networkService.configuration?.factoryAddress ?? "",
          resolverId: this.networkService.configuration?.resolverAddress ?? "",
        },
        wallet: SupportedWallets.METAMASK,
      });
    } else {
      LogService.logTrace("Paired Metamask failed with no accounts");
      this.eventService.emit(WalletEvents.walletDisconnect, {
        wallet: SupportedWallets.METAMASK,
      });
    }
  }

  private async setMetamaskNetwork(chainId: any): Promise<void> {
    const metamaskNetwork = HederaNetworks.find((i: any) => "0x" + i.chainId.toString(16) === chainId.toString());
    let network = unrecognized;
    let factoryId = "";
    let resolverId = "";
    let mirrorNode: MirrorNode = { baseUrl: "", apiKey: "", headerName: "" };
    let rpcNode: JsonRpcRelay = { baseUrl: "", apiKey: "", headerName: "" };

    if (metamaskNetwork) {
      network = metamaskNetwork.network;
      ({ factoryId, resolverId, mirrorNode, rpcNode } = this.getNetworkConfig(metamaskNetwork.network));
      LogService.logTrace("Metamask Network:", chainId);
    } else {
      LogService.logError(chainId + " not an hedera network");
    }

    await this.commandBus.execute(new SetNetworkCommand(network, mirrorNode, rpcNode));
    await this.commandBus.execute(new SetConfigurationCommand(factoryId, resolverId));
    this.signerOrProvider = new ethers.providers.Web3Provider(
      //@ts-expect-error No TS compatibility
      ethereum,
    ).getSigner();
  }

  private async setMetasmaskAccount(evmAddress: string): Promise<void> {
    try {
      const mirrorAccount = await this.mirrorNodeAdapter.getAccountInfo(evmAddress);
      this.account = new Account({
        id: mirrorAccount.id!.toString(),
        evmAddress: mirrorAccount.evmAddress,
        publicKey: mirrorAccount.publicKey,
      });
      this.signerOrProvider = new ethers.providers.Web3Provider(
        //@ts-expect-error No TS compatibility
        ethereum,
      ).getSigner();
      LogService.logTrace("Paired Metamask Wallet Event:", this.account);
    } catch (e) {
      LogService.logError("account could not be retrieved from mirror error : " + e);
      this.account = Account.NULL;
    }
  }

  private async getFirstAccount(): Promise<string | null> {
    const accts = await ethereum.request({ method: "eth_requestAccounts" });
    return accts && "length" in accts && (accts as string[]).length > 0 ? (accts as string[])[0] : null;
  }

  private getNetworkConfig(environment: string): {
    factoryId: string;
    resolverId: string;
    mirrorNode: MirrorNode;
    rpcNode: JsonRpcRelay;
  } {
    let factoryId = "";
    let resolverId = "";
    let mirrorNode: MirrorNode = { baseUrl: "", apiKey: "", headerName: "" };
    let rpcNode: JsonRpcRelay = { baseUrl: "", apiKey: "", headerName: "" };

    if (this.factories) {
      const result = this.factories.factories.find((i: EnvironmentFactory) => i.environment === environment);
      factoryId = result?.factory.toString() ?? "";
      if (!result) LogService.logError(`Factories could not be found for environment ${environment}`);
    }
    if (this.resolvers) {
      const result = this.resolvers.resolvers.find((i: EnvironmentResolver) => i.environment === environment);
      resolverId = result?.resolver.toString() ?? "";
      if (!result) LogService.logError(`Resolvers could not be found for environment ${environment}`);
    }
    if (this.mirrorNodes) {
      const result = this.mirrorNodes.nodes.find((i: EnvironmentMirrorNode) => i.environment === environment);
      mirrorNode = result?.mirrorNode ?? mirrorNode;
      if (!result) LogService.logError(`Mirror Nodes could not be found for environment ${environment}`);
    }
    if (this.jsonRpcRelays) {
      const result = this.jsonRpcRelays.nodes.find((i: EnvironmentJsonRpcRelay) => i.environment === environment);
      rpcNode = result?.jsonRpcRelay ?? rpcNode;
      if (!result) LogService.logError(`RPC Nodes could not be found for environment ${environment}`);
    }

    return { factoryId, resolverId, mirrorNode, rpcNode };
  }

  private emitWalletPairedEvent(): void {
    this.eventService.emit(WalletEvents.walletPaired, {
      data: { account: this.account, pairing: "", topic: "" },
      network: {
        name: this.networkService.environment,
        recognized: this.networkService.environment !== unrecognized,
        factoryId: this.networkService.configuration?.factoryAddress ?? "",
        resolverId: this.networkService.configuration?.resolverAddress ?? "",
      },
      wallet: SupportedWallets.METAMASK,
    });
  }
}
