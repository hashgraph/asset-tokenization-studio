// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class TransferAndLockCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class TransferAndLockCommand extends Command<TransferAndLockCommandResponse> {
  constructor(
    public readonly amount: string,
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly expirationDate: string,
  ) {
    super();
  }
}
