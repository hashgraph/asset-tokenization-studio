import WalletEvent from '../../../app/service/event/WalletEvent.js';
import Configuration from '../../../domain/context/network/Configuration.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import {
  MirrorNode,
  MirrorNodes,
} from '../../../domain/context/network/MirrorNode.js';
import {
  JsonRpcRelay,
  JsonRpcRelays,
} from '../../../domain/context/network/JsonRpcRelay.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { BaseRequest } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import { Factories } from '../../../domain/context/factory/Factories.js';
import { Resolvers } from '../../../domain/context/factory/Resolvers.js';
import { BusinessLogicKeys } from '../../../domain/context/factory/BusinessLogicKeys.js';
export { SupportedWallets };

export default class InitializationRequest
  extends ValidatedRequest<InitializationRequest>
  implements BaseRequest
{
  network: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  events?: Partial<WalletEvent>;
  configuration?: Configuration;
  mirrorNodes?: MirrorNodes;
  jsonRpcRelays?: JsonRpcRelays;
  factories?: Factories;
  resolvers?: Resolvers;
  businessLogicKeysCommon?: BusinessLogicKeys;
  businessLogicKeysEquity?: BusinessLogicKeys;
  businessLogicKeysBond?: BusinessLogicKeys;

  constructor({
    network,
    mirrorNode,
    rpcNode,
    events,
    configuration,
    mirrorNodes,
    jsonRpcRelays,
    factories,
    resolvers,
    businessLogicKeysCommon,
    businessLogicKeysEquity,
    businessLogicKeysBond,
  }: {
    network: Environment;
    mirrorNode: MirrorNode;
    rpcNode: JsonRpcRelay;
    events?: Partial<WalletEvent>;
    configuration?: Configuration;
    mirrorNodes?: MirrorNodes;
    jsonRpcRelays?: JsonRpcRelays;
    factories?: Factories;
    resolvers?: Resolvers;
    businessLogicKeysCommon?: BusinessLogicKeys;
    businessLogicKeysEquity?: BusinessLogicKeys;
    businessLogicKeysBond?: BusinessLogicKeys;
  }) {
    super({});
    this.network = network;
    this.mirrorNode = mirrorNode;
    this.rpcNode = rpcNode;
    this.events = events;
    this.configuration = configuration;
    this.mirrorNodes = mirrorNodes;
    this.jsonRpcRelays = jsonRpcRelays;
    this.factories = factories;
    this.resolvers = resolvers;
    this.businessLogicKeysCommon = businessLogicKeysCommon;
    this.businessLogicKeysEquity = businessLogicKeysEquity;
    this.businessLogicKeysBond = businessLogicKeysBond;
  }
}
