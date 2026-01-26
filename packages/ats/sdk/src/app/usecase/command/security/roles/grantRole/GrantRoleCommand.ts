// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class GrantRoleCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class GrantRoleCommand extends Command<GrantRoleCommandResponse> {
  constructor(
    public readonly role: string,
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
