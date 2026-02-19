// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetInterestRateCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetInterestRateCommand extends Command<SetInterestRateCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly maxRate: string,
    public readonly baseRate: string,
    public readonly minRate: string,
    public readonly startPeriod: string,
    public readonly startRate: string,
    public readonly missedPenalty: string,
    public readonly reportPeriod: string,
    public readonly rateDecimals: number,
  ) {
    super();
  }
}
