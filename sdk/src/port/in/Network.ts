/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { InitializationData, NetworkData } from '../out/TransactionAdapter.js';
import { ConnectCommand } from '../../app/usecase/command/network/connect/ConnectCommand.js';
import ConnectRequest, { SupportedWallets } from './request/ConnectRequest.js';
import RequestMapper from './request/mapping/RequestMapper.js';
import TransactionService from '../../app/service/TransactionService.js';
import NetworkService from '../../app/service/NetworkService.js';
import SetNetworkRequest from './request/SetNetworkRequest.js';
import { SetNetworkCommand } from '../../app/usecase/command/network/setNetwork/SetNetworkCommand.js';
import { SetConfigurationCommand } from '../../app/usecase/command/network/setConfiguration/SetConfigurationCommand.js';
import {
  Environment,
  unrecognized,
} from '../../domain/context/network/Environment.js';
import InitializationRequest from './request/InitializationRequest.js';
import Event from './Event.js';
import { RPCTransactionAdapter } from '../out/rpc/RPCTransactionAdapter.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import SetConfigurationRequest from './request/SetConfigurationRequest.js';
import { handleValidation } from './Common.js';
import { MirrorNode } from '../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../domain/context/network/JsonRpcRelay.js';

export { InitializationData, NetworkData, SupportedWallets };

export type NetworkResponse = {
  environment: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  consensusNodes: string;
};

export type ConfigResponse = {
  factoryAddress: string;
  resolverAddress: string;
  businessLogicKeysCommon: string[];
  businessLogicKeysEquity: string[];
  businessLogicKeysBond: string[];
};

interface INetworkInPort {
  connect(req: ConnectRequest): Promise<InitializationData>;
  disconnect(): Promise<boolean>;
  setNetwork(req: SetNetworkRequest): Promise<NetworkResponse>;
  setConfig(req: SetConfigurationRequest): Promise<ConfigResponse>;
  getFactoryAddress(): string;
  getResolverAddress(): string;
  getBusinessLogicKeysCommon(): string[];
  getBusinessLogicKeysEquity(): string[];
  getBusinessLogicKeysBond(): string[];
  getNetwork(): string;
  isNetworkRecognized(): boolean;
}

class NetworkInPort implements INetworkInPort {
  constructor(
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly transactionService: TransactionService = Injectable.resolve(
      TransactionService,
    ),
    private readonly networkService: NetworkService = Injectable.resolve(
      NetworkService,
    ),
  ) {}

  @LogError
  async setConfig(req: SetConfigurationRequest): Promise<ConfigResponse> {
    handleValidation('SetConfigurationRequest', req);

    const res = await this.commandBus.execute(
      new SetConfigurationCommand(
        req.factoryAddress,
        req.resolverAddress,
        req.businessLogicKeysCommon,
        req.businessLogicKeysEquity,
        req.businessLogicKeysBond,
      ),
    );
    return res;
  }

  @LogError
  public getFactoryAddress(): string {
    return this.networkService.configuration
      ? this.networkService.configuration.factoryAddress
      : '';
  }

  @LogError
  public getResolverAddress(): string {
    return this.networkService.configuration
      ? this.networkService.configuration.resolverAddress
      : '';
  }

  @LogError
  public getBusinessLogicKeysCommon(): string[] {
    return this.networkService.configuration
      ? this.networkService.configuration.businessLogicKeysCommon
      : [];
  }

  @LogError
  public getBusinessLogicKeysEquity(): string[] {
    return this.networkService.configuration
      ? this.networkService.configuration.businessLogicKeysEquity
      : [];
  }

  @LogError
  public getBusinessLogicKeysBond(): string[] {
    return this.networkService.configuration
      ? this.networkService.configuration.businessLogicKeysBond
      : [];
  }

  @LogError
  public getNetwork(): string {
    return this.networkService.environment;
  }

  @LogError
  public isNetworkRecognized(): boolean {
    return this.networkService.environment != unrecognized;
  }

  @LogError
  async setNetwork(req: SetNetworkRequest): Promise<NetworkResponse> {
    handleValidation('SetNetworkRequest', req);

    const res = await this.commandBus.execute(
      new SetNetworkCommand(
        req.environment,
        req.mirrorNode,
        req.rpcNode,
        req.consensusNodes,
      ),
    );
    return res;
  }

  @LogError
  async init(req: InitializationRequest): Promise<SupportedWallets[]> {
    handleValidation('InitializationRequest', req);

    await this.setNetwork(
      new SetNetworkRequest({
        environment: req.network,
        mirrorNode: req.mirrorNode,
        rpcNode: req.rpcNode,
      }),
    );

    if (req.configuration)
      if (
        req.configuration.factoryAddress &&
        req.configuration.resolverAddress &&
        req.configuration.businessLogicKeysCommon &&
        req.configuration.businessLogicKeysEquity &&
        req.configuration.businessLogicKeysBond
      )
        await this.setConfig(
          new SetConfigurationRequest({
            factoryAddress: req.configuration.factoryAddress,
            resolverAddress: req.configuration.resolverAddress,
            businessLogicKeysCommon: req.configuration.businessLogicKeysCommon,
            businessLogicKeysEquity: req.configuration.businessLogicKeysEquity,
            businessLogicKeysBond: req.configuration.businessLogicKeysBond,
          }),
        );

    req.events && Event.register(req.events);
    const wallets: SupportedWallets[] = [];
    const instances = Injectable.registerTransactionAdapterInstances();
    for (const val of instances) {
      if (val instanceof RPCTransactionAdapter) {
        wallets.push(SupportedWallets.METAMASK);
      }
      await val.init();

      if (val instanceof RPCTransactionAdapter) {
        val.setMirrorNodes(req.mirrorNodes);
        val.setJsonRpcRelays(req.jsonRpcRelays);
        val.setFactories(req.factories);
        val.setResolvers(req.resolvers);
        val.setBusinessLogicKeysCommon(req.businessLogicKeysCommon);
        val.setBusinessLogicKeysEquity(req.businessLogicKeysEquity);
        val.setBusinessLogicKeysBond(req.businessLogicKeysBond);
      }
    }
    return wallets;
  }

  @LogError
  async connect(req: ConnectRequest): Promise<InitializationData> {
    console.log('ConnectRequest from network', req);
    handleValidation('ConnectRequest', req);
    const account = RequestMapper.mapAccount(req.account);
    const debug = req.debug ?? false;
    await this.commandBus.execute(
      new SetNetworkCommand(req.network, req.mirrorNode, req.rpcNode),
    );

    const res = await this.commandBus.execute(
      new ConnectCommand(req.network, req.wallet, account, debug),
    );
    return res.payload;
  }

  disconnect(): Promise<boolean> {
    return this.transactionService.getHandler().stop();
  }
}

const Network = new NetworkInPort();
export default Network;
