// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class UpdateExternalKycListsCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class UpdateExternalKycListsCommand extends Command<UpdateExternalKycListsCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly externalKycListsAddresses: string[],
    public readonly actives: boolean[],
  ) {
    super();
  }
}
