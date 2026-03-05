// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class CancelDividendCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class CancelDividendCommand extends Command<CancelDividendCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly dividendId: number,
  ) {
    super();
  }
}
