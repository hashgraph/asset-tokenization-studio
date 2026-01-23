// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class OperatorClearingTransferByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class OperatorClearingTransferByPartitionCommand extends Command<OperatorClearingTransferByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly amount: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly expirationDate: string,
  ) {
    super();
  }
}
