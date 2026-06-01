// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetCustomDataCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetCustomDataCommand extends Command<SetCustomDataCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly key: string,
    public readonly value: string[],
  ) {
    super();
  }
}
