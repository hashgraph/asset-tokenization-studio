// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export interface RbacCommand {
  role: string; // bytes32, can be a hex string or string converted to bytes32
  members: string[]; // array of addresses
}

export class DeployCommandResponse implements CommandResponse {
  constructor(public readonly payload: string) {}
}

export class DeployCommand extends Command<DeployCommandResponse> {
  constructor(
    public readonly asset: string,
    public readonly paymentToken: string,
    public readonly rbac: RbacCommand[],
  ) {
    super();
  }
}
