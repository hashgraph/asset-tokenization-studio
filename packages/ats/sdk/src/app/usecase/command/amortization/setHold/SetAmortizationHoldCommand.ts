// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetAmortizationHoldCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class SetAmortizationHoldCommand extends Command<SetAmortizationHoldCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amortizationId: number,
    public readonly tokenHolder: string,
    public readonly tokenAmount: string,
  ) {
    super();
  }
}
