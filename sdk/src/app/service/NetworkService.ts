import { singleton, inject } from 'tsyringe';
import Configuration from '../../domain/context/network/Configuration.js';
import { Environment } from '../../domain/context/network/Environment.js';
import { MirrorNode } from '../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../domain/context/network/JsonRpcRelay.js';
import Service from './Service.js';

export interface NetworkProps {
  environment: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  consensusNodes?: string;
  configuration?: Configuration;
}

@singleton()
export default class NetworkService extends Service implements NetworkProps {
  private _environment: Environment;
  private _mirrorNode: MirrorNode;
  private _rpcNode: JsonRpcRelay;
  private _consensusNodes?: string | undefined;
  private _configuration: Configuration;

  public set environment(value: Environment) {
    this._environment = value;
  }

  public get environment(): Environment {
    return this._environment;
  }

  public set configuration(value: Configuration) {
    this._configuration = value;
  }

  public get configuration(): Configuration {
    return this._configuration;
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

  constructor(@inject('NetworkProps') props?: NetworkProps) {
    super();
    Object.assign(this, props);
  }
}
