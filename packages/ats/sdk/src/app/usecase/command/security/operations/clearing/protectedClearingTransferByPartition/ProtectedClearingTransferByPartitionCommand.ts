// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ProtectedClearingTransferByPartitionCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class ProtectedClearingTransferByPartitionCommand extends Command<ProtectedClearingTransferByPartitionCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly amount: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly expirationDate: string,
    public readonly deadline: string,
    public readonly nonce: number,
    public readonly signature: string,
  ) {
    super();
  }
}
