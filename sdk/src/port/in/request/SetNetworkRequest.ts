import { Environment } from '../../../domain/context/network/Environment.js';
import { MirrorNode } from '../../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../domain/context/network/JsonRpcRelay.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export interface SetNetworkRequestProps {
  environment: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  consensusNodes?: string;
}

export default class SetNetworkRequest extends ValidatedRequest<SetNetworkRequest> {
  environment: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  consensusNodes?: string;
  constructor(props: SetNetworkRequestProps) {
    super({
      environment: Validation.checkString({ emptyCheck: true }),
    });
    Object.assign(this, props);
  }
}
