// SPDX-License-Identifier: Apache-2.0

import WalletEvent from "@app/services/event/WalletEvent";
import { Environment } from "@domain/network/Environment";
import { MirrorNode, MirrorNodes } from "@domain/network/MirrorNode";
import { JsonRpcRelay, JsonRpcRelays } from "@domain/network/JsonRpcRelay";
import { SupportedWallets } from "@domain/network/Wallet";
import { BaseRequest } from "../BaseRequest";
import ValidatedRequest from "@core/validation/ValidatedArgs";
export { SupportedWallets };

export default class InitializationRequest extends ValidatedRequest<InitializationRequest> implements BaseRequest {
  network: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  events?: Partial<WalletEvent>;
  mirrorNodes?: MirrorNodes;
  jsonRpcRelays?: JsonRpcRelays;

  constructor({
    network,
    mirrorNode,
    rpcNode,
    events,
    mirrorNodes,
    jsonRpcRelays,
  }: {
    network: Environment;
    mirrorNode: MirrorNode;
    rpcNode: JsonRpcRelay;
    events?: Partial<WalletEvent>;
    mirrorNodes?: MirrorNodes;
    jsonRpcRelays?: JsonRpcRelays;
  }) {
    super({});
    this.network = network;
    this.mirrorNode = mirrorNode;
    this.rpcNode = rpcNode;
    this.events = events;
    this.mirrorNodes = mirrorNodes;
    this.jsonRpcRelays = jsonRpcRelays;
  }
}
