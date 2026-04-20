// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ReleaseAmortizationHoldCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ReleaseAmortizationHoldCommand extends Command<ReleaseAmortizationHoldCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amortizationId: number,
    public readonly tokenHolder: string,
  ) {
    super();
  }
}
