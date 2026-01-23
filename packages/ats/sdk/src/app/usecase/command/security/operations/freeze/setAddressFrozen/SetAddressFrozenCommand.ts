// SPDX-License-Identifier: Apache-2.0
import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetAddressFrozenCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetAddressFrozenCommand extends Command<SetAddressFrozenCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly status: boolean,
    public readonly targetId: string,
  ) {
    super();
  }
}
