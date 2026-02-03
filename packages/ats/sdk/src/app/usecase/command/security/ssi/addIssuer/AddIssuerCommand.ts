// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class AddIssuerCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class AddIssuerCommand extends Command<AddIssuerCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly issuerId: string,
  ) {
    super();
  }
}
