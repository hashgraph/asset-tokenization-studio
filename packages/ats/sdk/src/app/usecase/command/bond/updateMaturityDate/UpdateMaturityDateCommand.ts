// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class UpdateMaturityDateCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class UpdateMaturityDateCommand extends Command<UpdateMaturityDateCommandResponse> {
  constructor(
    public readonly maturityDate: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
