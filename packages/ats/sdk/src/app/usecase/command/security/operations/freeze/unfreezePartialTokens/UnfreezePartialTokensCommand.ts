// SPDX-License-Identifier: Apache-2.0
import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class UnfreezePartialTokensResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class UnfreezePartialTokensCommand extends Command<UnfreezePartialTokensResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amount: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
