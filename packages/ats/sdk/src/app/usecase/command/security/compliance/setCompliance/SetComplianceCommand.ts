// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetComplianceCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetComplianceCommand extends Command<SetComplianceCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly compliance: string,
  ) {
    super();
  }
}
