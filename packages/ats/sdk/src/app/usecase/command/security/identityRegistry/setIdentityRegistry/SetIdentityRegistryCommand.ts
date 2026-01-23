// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetIdentityRegistryCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetIdentityRegistryCommand extends Command<SetIdentityRegistryCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly identityRegistry: string,
  ) {
    super();
  }
}
