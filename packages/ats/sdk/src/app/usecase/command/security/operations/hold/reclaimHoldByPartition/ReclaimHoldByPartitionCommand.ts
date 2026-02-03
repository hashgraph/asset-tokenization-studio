// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ReclaimHoldByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ReclaimHoldByPartitionCommand extends Command<ReclaimHoldByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly holdId: number,
    public readonly targetId: string,
  ) {
    super();
  }
}
