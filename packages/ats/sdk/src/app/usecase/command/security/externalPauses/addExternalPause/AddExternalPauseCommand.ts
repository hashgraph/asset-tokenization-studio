// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class AddExternalPauseCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class AddExternalPauseCommand extends Command<AddExternalPauseCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly externalPauseAddress: string,
  ) {
    super();
  }
}
