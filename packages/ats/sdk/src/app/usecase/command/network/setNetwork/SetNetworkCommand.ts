// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import { Environment } from "@domain/context/network/Environment";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";

export class SetNetworkCommandResponse implements CommandResponse {
  constructor(
    public readonly environment: Environment,
    public readonly mirrorNode: MirrorNode,
    public readonly rpcNode: JsonRpcRelay,
    public readonly consensusNodes: string,
  ) {}
}

export class SetNetworkCommand extends Command<SetNetworkCommandResponse> {
  constructor(
    public readonly environment: Environment,
    public readonly mirrorNode: MirrorNode,
    public readonly rpcNode: JsonRpcRelay,
    public readonly consensusNodes?: string,
  ) {
    super();
  }
}
