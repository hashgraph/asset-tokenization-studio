// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class IssueCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class IssueCommand extends Command<IssueCommandResponse> {
  constructor(
    public readonly amount: string,
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
