// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ReleaseCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ReleaseCommand extends Command<ReleaseCommandResponse> {
  constructor(
    public readonly lockId: number,
    public readonly sourceId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
