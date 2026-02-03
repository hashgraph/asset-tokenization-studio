// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class CreateExternalBlackListMockCommandResponse implements CommandResponse {
  constructor(public readonly payload: string) {}
}

export class CreateExternalBlackListMockCommand extends Command<CreateExternalBlackListMockCommandResponse> {
  constructor() {
    super();
  }
}
