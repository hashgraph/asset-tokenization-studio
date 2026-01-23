// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class RemoveIssuerCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class RemoveIssuerCommand extends Command<RemoveIssuerCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly issuerId: string,
  ) {
    super();
  }
}
