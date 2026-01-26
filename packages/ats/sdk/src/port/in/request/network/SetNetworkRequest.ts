// SPDX-License-Identifier: Apache-2.0

import { Environment } from "@domain/context/network/Environment";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

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
      environment: FormatValidation.checkString({ emptyCheck: true }),
    });
    Object.assign(this, props);
  }
}
