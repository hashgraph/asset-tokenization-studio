// SPDX-License-Identifier: Apache-2.0
import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class BatchForcedTransferResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class BatchForcedTransferCommand extends Command<BatchForcedTransferResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amountList: string[],
    public readonly fromList: string[],
    public readonly toList: string[],
  ) {
    super();
  }
}
