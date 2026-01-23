// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from "@nestjs/common";
import { InitializationData, NetworkData } from "@port/out/TransactionAdapter";
import ConnectRequest, { DFNSConfigRequest, SupportedWallets } from "../request/network/ConnectRequest";
import RequestMapper from "../request/mapping/RequestMapper";
import TransactionService from "@app/services/transaction/TransactionService";
import NetworkService from "@app/services/network/NetworkService";
import Account from "@domain/account/Account";
import SetNetworkRequest from "../request/network/SetNetworkRequest";
import { Environment, unrecognized } from "@domain/network/Environment";
import InitializationRequest from "../request/network/InitializationRequest";
import { Event } from "@port/in/event/Event";
import { LogError } from "@core/decorator/LogErrorDecorator";
import { SetNetworkError } from "./error/SetNetworkError";
import { ExecuteConnectionError } from "./error/ExecuteConnectionError";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { DFNSTransactionAdapter } from "@port/out/hs/hts/custodial/DFNSTransactionAdapter";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";
import SetNetworkResponse from "./response/SetNetworkResponse";
import ExecuteConnectionResponse from "./response/ExecuteConnectionResponse";

export { InitializationData, NetworkData, SupportedWallets };

interface INetworkInPort {
  connect(req: ConnectRequest): Promise<InitializationData>;
  disconnect(): Promise<boolean>;
  setNetwork(req: SetNetworkRequest): Promise<SetNetworkResponse>;
  getNetwork(): string;
  isNetworkRecognized(): boolean;
}

@Injectable()
export class Network implements INetworkInPort {
  protected readonly logger = new Logger(Network.name);

  constructor(
    private readonly networkService: NetworkService,
    private readonly transactionService: TransactionService,
    private readonly dfnsTransactionAdapter: DFNSTransactionAdapter,
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    private readonly rpcQueryAdapter: RPCQueryAdapter,
    private readonly event: Event,
  ) {}

  @LogError
  public getNetwork(): string {
    return this.networkService.environment;
  }

  @LogError
  public isNetworkRecognized(): boolean {
    return this.networkService.environment != unrecognized;
  }

  @LogError
  async setNetwork(req: SetNetworkRequest): Promise<SetNetworkResponse> {
    ValidatedRequest.handleValidation("SetNetworkRequest", req);
    try {
      this.networkService.environment = req.environment;
      if (req.consensusNodes) this.networkService.consensusNodes = req.consensusNodes;
      if (req.rpcNode) this.networkService.rpcNode = req.rpcNode;

      // Init Mirror Node Adapter
      this.mirrorNodeAdapter.set(req.mirrorNode);
      this.networkService.mirrorNode = req.mirrorNode;

      // Init RPC Query Adapter
      this.rpcQueryAdapter.init(this.networkService.rpcNode.baseUrl, this.networkService.rpcNode.apiKey);

      return Promise.resolve(
        new SetNetworkResponse(
          this.networkService.environment,
          this.networkService.mirrorNode,
          this.networkService.rpcNode,
        ),
      );
    } catch (error) {
      throw new SetNetworkError(error as Error);
    }
  }

  async executeConnection(
    environment: Environment,
    wallet: SupportedWallets,
    account?: Account,
    custodialSettings?: DfnsSettings,
  ): Promise<ExecuteConnectionResponse> {
    try {
      const handler = this.transactionService.getHandlerClass(wallet);
      const input = custodialSettings === undefined ? account : custodialSettings;

      const registration = await handler.register(input);

      return Promise.resolve(new ExecuteConnectionResponse(registration, wallet));
    } catch (error) {
      throw new ExecuteConnectionError(error as Error);
    }
  }

  @LogError
  async init(req: InitializationRequest): Promise<SupportedWallets[]> {
    ValidatedRequest.handleValidation("InitializationRequest", req);
    await this.setNetwork(
      new SetNetworkRequest({
        environment: req.network,
        mirrorNode: req.mirrorNode,
        rpcNode: req.rpcNode,
      }),
    );
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    req.events && this.event.register(req.events);
    const wallets: SupportedWallets[] = [];
    wallets.push(SupportedWallets.DFNS);
    await this.dfnsTransactionAdapter.init();
    return wallets;
  }

  @LogError
  async connect(req: ConnectRequest): Promise<InitializationData> {
    this.logger.log("ConnectRequest from network", req);
    ValidatedRequest.handleValidation("ConnectRequest", req);

    const account = req.account ? RequestMapper.mapAccount(req.account) : undefined;
    const custodialSettings = this.getCustodialSettings(req);
    this.logger.log("SetNetwork", req.network, req.mirrorNode, req.rpcNode);

    await this.setNetwork(
      new SetNetworkRequest({
        environment: req.network,
        mirrorNode: req.mirrorNode,
        rpcNode: req.rpcNode,
      }),
    );

    this.logger.log("ConnectRequest", req.wallet, account, custodialSettings);
    const res = await this.executeConnection(req.network, req.wallet, account, custodialSettings);
    return res.payload;
  }

  private getCustodialSettings(req: ConnectRequest): DfnsSettings | undefined {
    if (!req.custodialWalletSettings) {
      return undefined;
    }

    switch (req.wallet) {
      case SupportedWallets.DFNS:
        return RequestMapper.dfnsRequestToDfnsSettings(req.custodialWalletSettings as DFNSConfigRequest);

      default:
        return undefined;
    }
  }

  disconnect(): Promise<boolean> {
    return this.transactionService.getHandler().stop();
  }
}
