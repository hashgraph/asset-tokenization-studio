// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { InitializationData, NetworkData } from "@port/out/TransactionAdapter";
import { ConnectCommand } from "@command/network/connect/ConnectCommand";
import ConnectRequest, {
  AWSKMSConfigRequest,
  DFNSConfigRequest,
  FireblocksConfigRequest,
  SupportedWallets,
} from "../request/network/ConnectRequest";
import RequestMapper from "../request/mapping/RequestMapper";
import TransactionService from "@service/transaction/TransactionService";
import NetworkService from "@service/network/NetworkService";
import SetNetworkRequest from "../request/network/SetNetworkRequest";
import { SetNetworkCommand } from "@command/network/setNetwork/SetNetworkCommand";
import { SetConfigurationCommand } from "@command/network/setConfiguration/SetConfigurationCommand";
import { Environment, unrecognized } from "@domain/context/network/Environment";
import InitializationRequest from "../request/network/InitializationRequest";
import Event from "../event/Event";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import { LogError } from "@core/decorator/LogErrorDecorator";
import SetConfigurationRequest from "../request/management/SetConfigurationRequest";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import { HederaWalletConnectTransactionAdapter } from "@port/out/hs/walletconnect/HederaWalletConnectTransactionAdapter";
import { DFNSTransactionAdapter } from "@port/out/hs/custodial/DFNSTransactionAdapter";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";
import { FireblocksTransactionAdapter } from "@port/out/hs/custodial/FireblocksTransactionAdapter";
import FireblocksSettings from "@core/settings/custodialWalletSettings/FireblocksSettings";
import { AWSKMSTransactionAdapter } from "@port/out/hs/custodial/AWSKMSTransactionAdapter";
import LogService from "@service/log/LogService";

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
};

interface INetworkInPort {
  connect(req: ConnectRequest): Promise<InitializationData>;
  disconnect(): Promise<boolean>;
  setNetwork(req: SetNetworkRequest): Promise<NetworkResponse>;
  setConfig(req: SetConfigurationRequest): Promise<ConfigResponse>;
  getFactoryAddress(): string;
  getResolverAddress(): string;
  getNetwork(): string;
  isNetworkRecognized(): boolean;
}

class NetworkInPort implements INetworkInPort {
  constructor(
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly transactionService: TransactionService = Injectable.resolve(TransactionService),
    private readonly networkService: NetworkService = Injectable.resolve(NetworkService),
  ) {}

  @LogError
  async setConfig(req: SetConfigurationRequest): Promise<ConfigResponse> {
    ValidatedRequest.handleValidation("SetConfigurationRequest", req);

    const res = await this.commandBus.execute(new SetConfigurationCommand(req.factoryAddress, req.resolverAddress));
    return res;
  }

  @LogError
  public getFactoryAddress(): string {
    return this.networkService.configuration ? this.networkService.configuration.factoryAddress : "";
  }

  @LogError
  public getResolverAddress(): string {
    return this.networkService.configuration ? this.networkService.configuration.resolverAddress : "";
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
    ValidatedRequest.handleValidation("SetNetworkRequest", req);

    const res = await this.commandBus.execute(
      new SetNetworkCommand(req.environment, req.mirrorNode, req.rpcNode, req.consensusNodes),
    );
    return res;
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

    if (req.configuration)
      if (req.configuration.factoryAddress && req.configuration.resolverAddress)
        await this.setConfig(
          new SetConfigurationRequest({
            factoryAddress: req.configuration.factoryAddress,
            resolverAddress: req.configuration.resolverAddress,
          }),
        );

    req.events && Event.register(req.events);
    const wallets: SupportedWallets[] = [];
    const instances = Injectable.registerTransactionAdapterInstances();
    for (const val of instances) {
      if (val instanceof RPCTransactionAdapter) {
        wallets.push(SupportedWallets.METAMASK);
      } else if (val instanceof HederaWalletConnectTransactionAdapter) {
        wallets.push(SupportedWallets.HWALLETCONNECT);
      } else if (val instanceof DFNSTransactionAdapter) {
        wallets.push(SupportedWallets.DFNS);
      } else if (val instanceof FireblocksTransactionAdapter) {
        wallets.push(SupportedWallets.FIREBLOCKS);
      } else if (val instanceof AWSKMSTransactionAdapter) {
        wallets.push(SupportedWallets.AWSKMS);
      }
      await val.init();

      if (val instanceof RPCTransactionAdapter) {
        val.setConfig({
          mirrorNodes: req.mirrorNodes,
          jsonRpcRelays: req.jsonRpcRelays,
          factories: req.factories,
          resolvers: req.resolvers,
        });
      }
    }
    return wallets;
  }

  @LogError
  async connect(req: ConnectRequest): Promise<InitializationData> {
    LogService.logInfo("ConnectRequest from network", req);
    ValidatedRequest.handleValidation("ConnectRequest", req);

    const account = req.account ? RequestMapper.mapAccount(req.account) : undefined;
    const debug = req.debug ?? false;
    const hwcSettings = req.hwcSettings ? RequestMapper.hwcRequestToHWCSettings(req.hwcSettings) : undefined;
    const custodialSettings = this.getCustodialSettings(req);
    LogService.logTrace("SetNetworkCommand", req.network, req.mirrorNode, req.rpcNode);
    await this.commandBus.execute(new SetNetworkCommand(req.network, req.mirrorNode, req.rpcNode));

    LogService.logTrace("ConnectRequest", req.wallet, account, hwcSettings, debug, custodialSettings);
    const res = await this.commandBus.execute(
      new ConnectCommand(req.network, req.wallet, account, hwcSettings, debug, custodialSettings),
    );
    return res.payload;
  }

  private getCustodialSettings(
    req: ConnectRequest,
  ): DfnsSettings | FireblocksSettings | AWSKMSConfigRequest | undefined {
    if (!req.custodialWalletSettings) {
      return undefined;
    }

    switch (req.wallet) {
      case SupportedWallets.DFNS:
        return RequestMapper.dfnsRequestToDfnsSettings(req.custodialWalletSettings as DFNSConfigRequest);

      case SupportedWallets.FIREBLOCKS:
        return RequestMapper.fireblocksRequestToFireblocksSettings(
          req.custodialWalletSettings as FireblocksConfigRequest,
        );

      case SupportedWallets.AWSKMS:
        return RequestMapper.awsKmsRequestToAwsKmsSettings(req.custodialWalletSettings as AWSKMSConfigRequest);

      default:
        return undefined;
    }
  }

  disconnect(): Promise<boolean> {
    return this.transactionService.getHandler().stop();
  }
}

const Network = new NetworkInPort();
export default Network;
