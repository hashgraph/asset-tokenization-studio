// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class DisconnectCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class DisconnectCommand extends Command<DisconnectCommandResponse> {
  constructor() {
    super();
  }
}
