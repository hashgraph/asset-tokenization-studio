// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class LockCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class LockCommand extends Command<LockCommandResponse> {
  constructor(
    public readonly amount: string,
    public readonly sourceId: string,
    public readonly securityId: string,
    public readonly expirationDate: string,
  ) {
    super();
  }
}
