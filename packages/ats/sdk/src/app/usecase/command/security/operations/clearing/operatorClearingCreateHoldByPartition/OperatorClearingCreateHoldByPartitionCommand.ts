// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class OperatorClearingCreateHoldByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class OperatorClearingCreateHoldByPartitionCommand extends Command<OperatorClearingCreateHoldByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly escrowId: string,
    public readonly amount: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly clearingExpirationDate: string,
    public readonly holdExpirationDate: string,
  ) {
    super();
  }
}
