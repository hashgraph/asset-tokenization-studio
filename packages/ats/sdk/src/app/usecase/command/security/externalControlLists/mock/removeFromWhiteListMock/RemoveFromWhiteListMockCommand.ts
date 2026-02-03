// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class RemoveFromWhiteListMockCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class RemoveFromWhiteListMockCommand extends Command<RemoveFromWhiteListMockCommandResponse> {
  constructor(
    public readonly contractId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
