// SPDX-License-Identifier: Apache-2.0
import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class BatchBurnResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class BatchBurnCommand extends Command<BatchBurnResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amountList: string[],
    public readonly targetList: string[],
  ) {
    super();
  }
}
