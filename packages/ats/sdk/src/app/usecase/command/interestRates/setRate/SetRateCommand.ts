// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetRateCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetRateCommand extends Command<SetRateCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly rate: string,
    public readonly rateDecimals: number,
  ) {
    super();
  }
}
