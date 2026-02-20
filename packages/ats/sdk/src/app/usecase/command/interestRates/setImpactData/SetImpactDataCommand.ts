// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetImpactDataCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetImpactDataCommand extends Command<SetImpactDataCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly maxDeviationCap: string,
    public readonly baseLine: string,
    public readonly maxDeviationFloor: string,
    public readonly impactDataDecimals: number,
    public readonly adjustmentPrecision: string,
  ) {
    super();
  }
}
