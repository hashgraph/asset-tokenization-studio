// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class GrantKycMockCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class GrantKycMockCommand extends Command<GrantKycMockCommandResponse> {
  constructor(
    public readonly contractId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
