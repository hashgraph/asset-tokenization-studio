// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetDividendsCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class SetDividendsCommand extends Command<SetDividendsCommandResponse> {
  constructor(
    public readonly address: string,
    public readonly recordDate: string,
    public readonly executionDate: string,
    public readonly amount: string,
  ) {
    super();
  }
}
