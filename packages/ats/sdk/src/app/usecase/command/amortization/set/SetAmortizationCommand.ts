// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetAmortizationCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class SetAmortizationCommand extends Command<SetAmortizationCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly recordDate: string,
    public readonly executionDate: string,
    public readonly tokensToRedeem: string,
  ) {
    super();
  }
}
