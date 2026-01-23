// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class OperatorClearingRedeemByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class OperatorClearingRedeemByPartitionCommand extends Command<OperatorClearingRedeemByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly amount: string,
    public readonly sourceId: string,
    public readonly expirationDate: string,
  ) {
    super();
  }
}
