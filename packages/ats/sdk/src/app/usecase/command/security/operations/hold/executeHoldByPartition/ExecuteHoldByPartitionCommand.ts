// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ExecuteHoldByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ExecuteHoldByPartitionCommand extends Command<ExecuteHoldByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly sourceId: string,
    public readonly amount: string,
    public readonly holdId: number,
    public readonly targetId: string,
    public readonly partitionId: string,
  ) {
    super();
  }
}
