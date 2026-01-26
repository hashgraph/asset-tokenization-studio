// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class UnpauseCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class UnpauseCommand extends Command<UnpauseCommandResponse> {
  constructor(public readonly lifeCycleCashFlowId: string) {
    super();
  }
}
