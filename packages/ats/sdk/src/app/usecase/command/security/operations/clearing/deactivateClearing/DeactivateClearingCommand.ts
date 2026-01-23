// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class DeactivateClearingCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class DeactivateClearingCommand extends Command<DeactivateClearingCommandResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
