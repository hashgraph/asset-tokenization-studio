// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class CreateHoldFromByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class CreateHoldFromByPartitionCommand extends Command<CreateHoldFromByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly escrowId: string,
    public readonly amount: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly expirationDate: string,
  ) {
    super();
  }
}
