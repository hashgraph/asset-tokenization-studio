// SPDX-License-Identifier: Apache-2.0

import { Inject, Injectable } from "@nestjs/common";
import { Environment } from "@domain/network/Environment";
import { MirrorNode } from "@domain/network/MirrorNode";
import { JsonRpcRelay } from "@domain/network/JsonRpcRelay";
import Service from "@app/services/Service";

export interface NetworkProps {
  environment: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  consensusNodes?: string;
}

@Injectable()
export default class NetworkService extends Service implements NetworkProps {
  private _environment: Environment;
  private _mirrorNode: MirrorNode;
  private _rpcNode: JsonRpcRelay;
  private _consensusNodes?: string | undefined;

  public set environment(value: Environment) {
    this._environment = value;
  }

  public get environment(): Environment {
    return this._environment;
  }

  public get mirrorNode(): MirrorNode {
    return this._mirrorNode;
  }

  public set mirrorNode(value: MirrorNode) {
    this._mirrorNode = value;
  }

  public get rpcNode(): JsonRpcRelay {
    return this._rpcNode;
  }

  public set rpcNode(value: JsonRpcRelay) {
    this._rpcNode = value;
  }

  public get consensusNodes(): string | undefined {
    return this._consensusNodes;
  }

  public set consensusNodes(value: string | undefined) {
    this._consensusNodes = value;
  }

  constructor(@Inject("NetworkProps") props?: NetworkProps) {
    super();
    Object.assign(this, props);
  }
}
