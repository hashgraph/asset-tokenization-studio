// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetScheduledBalanceAdjustmentCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class SetScheduledBalanceAdjustmentCommand extends Command<SetScheduledBalanceAdjustmentCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly executionDate: string,
    public readonly factor: string,
    public readonly decimals: string,
  ) {
    super();
  }
}
