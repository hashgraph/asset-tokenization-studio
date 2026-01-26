// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class UpdateExternalControlListsCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class UpdateExternalControlListsCommand extends Command<UpdateExternalControlListsCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly externalControlListsAddresses: string[],
    public readonly actives: boolean[],
  ) {
    super();
  }
}
