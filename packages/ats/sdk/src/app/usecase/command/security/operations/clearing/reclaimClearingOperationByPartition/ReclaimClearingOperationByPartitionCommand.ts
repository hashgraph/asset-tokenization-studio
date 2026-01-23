// SPDX-License-Identifier: Apache-2.0

import { ClearingOperationType } from "@domain/context/security/Clearing";
import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ReclaimClearingOperationByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ReclaimClearingOperationByPartitionCommand extends Command<ReclaimClearingOperationByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly targetId: string,
    public readonly clearingId: number,
    public readonly clearingOperationType: ClearingOperationType,
  ) {
    super();
  }
}
