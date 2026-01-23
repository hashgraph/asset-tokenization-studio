// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class GrantKycCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class GrantKycCommand extends Command<GrantKycCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
    public readonly vcBase64: string,
  ) {
    super();
  }
}
