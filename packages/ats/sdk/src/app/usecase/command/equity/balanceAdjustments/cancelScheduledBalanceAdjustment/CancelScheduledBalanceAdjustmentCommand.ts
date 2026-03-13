// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class CancelScheduledBalanceAdjustmentCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class CancelScheduledBalanceAdjustmentCommand extends Command<CancelScheduledBalanceAdjustmentCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly balanceAdjustmentId: number,
  ) {
    super();
  }
}
