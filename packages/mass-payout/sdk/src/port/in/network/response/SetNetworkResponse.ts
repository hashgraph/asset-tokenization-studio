// SPDX-License-Identifier: Apache-2.0

import { Environment } from "@domain/network/Environment";
import { MirrorNode } from "@domain/network/MirrorNode";
import { JsonRpcRelay } from "@domain/network/JsonRpcRelay";

export default class SetNetworkResponse {
  constructor(
    public readonly environment: Environment,
    public readonly mirrorNode: MirrorNode,
    public readonly rpcNode: JsonRpcRelay,
  ) {}
}
