// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ActivateInternalKycCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ActivateInternalKycCommand extends Command<ActivateInternalKycCommandResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
