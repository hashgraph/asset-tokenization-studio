// SPDX-License-Identifier: Apache-2.0

import { CommandResponse } from "@core/command/CommandResponse";
import { Command } from "@core/command/Command";

export class AddAgentCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class AddAgentCommand extends Command<AddAgentCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly agentId: string,
  ) {
    super();
  }
}
