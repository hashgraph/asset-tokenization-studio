// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class CreateExternalPauseMockCommandResponse implements CommandResponse {
  constructor(public readonly payload: string) {}
}

export class CreateExternalPauseMockCommand extends Command<CreateExternalPauseMockCommandResponse> {
  constructor() {
    super();
  }
}
