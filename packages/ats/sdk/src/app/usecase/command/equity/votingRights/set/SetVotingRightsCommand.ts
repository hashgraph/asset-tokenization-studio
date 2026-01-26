// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetVotingRightsCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class SetVotingRightsCommand extends Command<SetVotingRightsCommandResponse> {
  constructor(
    public readonly address: string,
    public readonly recordDate: string,
    public readonly data: string,
  ) {
    super();
  }
}
