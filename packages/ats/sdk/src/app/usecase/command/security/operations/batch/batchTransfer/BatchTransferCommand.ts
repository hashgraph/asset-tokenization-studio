// SPDX-License-Identifier: Apache-2.0
import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class BatchTransferResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class BatchTransferCommand extends Command<BatchTransferResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amountList: string[],
    public readonly toList: string[],
  ) {
    super();
  }
}
