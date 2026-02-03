// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class RemoveProceedRecipientCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class RemoveProceedRecipientCommand extends Command<RemoveProceedRecipientCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly proceedRecipient: string,
  ) {
    super();
  }
}
