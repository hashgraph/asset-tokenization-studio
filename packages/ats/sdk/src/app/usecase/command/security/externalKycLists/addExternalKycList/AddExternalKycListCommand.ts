// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class AddExternalKycListCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class AddExternalKycListCommand extends Command<AddExternalKycListCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly externalKycListAddress: string,
  ) {
    super();
  }
}
