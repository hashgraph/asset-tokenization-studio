// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class RedeemCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class RedeemCommand extends Command<RedeemCommandResponse> {
  constructor(
    public readonly amount: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
