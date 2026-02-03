// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetNameCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetNameCommand extends Command<SetNameCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly name: string,
  ) {
    super();
  }
}
