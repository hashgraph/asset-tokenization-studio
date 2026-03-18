// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class CancelVotingCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class CancelVotingCommand extends Command<CancelVotingCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly votingId: number,
  ) {
    super();
  }
}
