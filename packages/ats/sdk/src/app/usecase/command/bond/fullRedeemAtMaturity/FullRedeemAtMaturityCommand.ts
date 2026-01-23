// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class FullRedeemAtMaturityCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class FullRedeemAtMaturityCommand extends Command<FullRedeemAtMaturityCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly sourceId: string,
  ) {
    super();
  }
}
