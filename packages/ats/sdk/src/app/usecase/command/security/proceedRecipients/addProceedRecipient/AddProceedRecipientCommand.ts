// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class AddProceedRecipientCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class AddProceedRecipientCommand extends Command<AddProceedRecipientCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly proceedRecipient: string,
    public readonly data?: string,
  ) {
    super();
  }
}
