// SPDX-License-Identifier: Apache-2.0
import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class BatchSetAddressFrozenResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class BatchSetAddressFrozenCommand extends Command<BatchSetAddressFrozenResponse> {
  constructor(
    public readonly securityId: string,
    public readonly freezeStatusList: boolean[],
    public readonly targetList: string[],
  ) {
    super();
  }
}
