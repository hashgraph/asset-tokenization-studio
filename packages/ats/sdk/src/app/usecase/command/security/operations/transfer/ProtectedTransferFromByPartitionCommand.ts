// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ProtectedTransferFromByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ProtectedTransferFromByPartitionCommand extends Command<ProtectedTransferFromByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly amount: string,
    public readonly deadline: string,
    public readonly nounce: number,
    public readonly signature: string,
  ) {
    super();
  }
}
