// SPDX-License-Identifier: Apache-2.0

import { CommandResponse } from "@core/command/CommandResponse";
import { Command } from "@core/command/Command";

export class ProtectPartitionsCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ProtectPartitionsCommand extends Command<ProtectPartitionsCommandResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
