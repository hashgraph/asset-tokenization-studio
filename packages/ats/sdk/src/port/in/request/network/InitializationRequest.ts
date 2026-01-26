// SPDX-License-Identifier: Apache-2.0

import WalletEvent from "@service/event/WalletEvent";
import Configuration from "@domain/context/network/Configuration";
import { Environment } from "@domain/context/network/Environment";
import { MirrorNode, MirrorNodes } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay, JsonRpcRelays } from "@domain/context/network/JsonRpcRelay";
import { SupportedWallets } from "@domain/context/network/Wallet";
import { BaseRequest } from "../BaseRequest";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { Factories } from "@domain/context/factory/Factories";
import { Resolvers } from "@domain/context/factory/Resolvers";
export { SupportedWallets };

export default class InitializationRequest extends ValidatedRequest<InitializationRequest> implements BaseRequest {
  network: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  events?: Partial<WalletEvent>;
  configuration?: Configuration;
  mirrorNodes?: MirrorNodes;
  jsonRpcRelays?: JsonRpcRelays;
  factories?: Factories;
  resolvers?: Resolvers;

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
  }
}
