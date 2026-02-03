// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetPausedMockCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetPausedMockCommand extends Command<SetPausedMockCommandResponse> {
  constructor(
    public readonly contractId: string,
    public readonly paused: boolean,
  ) {
    super();
  }
}
