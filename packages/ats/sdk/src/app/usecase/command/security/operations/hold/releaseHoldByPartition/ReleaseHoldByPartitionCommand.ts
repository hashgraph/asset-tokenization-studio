// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ReleaseHoldByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ReleaseHoldByPartitionCommand extends Command<ReleaseHoldByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly amount: string,
    public readonly holdId: number,
    public readonly targetId: string,
  ) {
    super();
  }
}
