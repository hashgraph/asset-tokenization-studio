// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class AddExternalControlListCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class AddExternalControlListCommand extends Command<AddExternalControlListCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly externalControlListAddress: string,
  ) {
    super();
  }
}
