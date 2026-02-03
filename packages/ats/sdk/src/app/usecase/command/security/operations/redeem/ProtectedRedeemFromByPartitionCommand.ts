// SPDX-License-Identifier: Apache-2.0

import { CommandResponse } from "@core/command/CommandResponse";
import { Command } from "@core/command/Command";

export class ProtectedRedeemFromByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ProtectedRedeemFromByPartitionCommand extends Command<ProtectedRedeemFromByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly sourceId: string,
    public readonly amount: string,
    public readonly deadline: string,
    public readonly nounce: number,
    public readonly signature: string,
  ) {
    super();
  }
}
