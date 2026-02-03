// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ApplyRolesCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ApplyRolesCommand extends Command<ApplyRolesCommandResponse> {
  constructor(
    public readonly roles: string[],
    public readonly actives: boolean[],
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
