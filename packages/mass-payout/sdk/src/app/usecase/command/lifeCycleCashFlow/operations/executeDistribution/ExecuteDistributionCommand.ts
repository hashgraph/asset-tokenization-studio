// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ExecuteDistributionCommandResponse implements CommandResponse {
  constructor(
    public readonly failed: string[],
    public readonly succeeded: string[],
    public readonly paidAmount: string[],
    public readonly executed: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ExecuteDistributionCommand extends Command<ExecuteDistributionCommandResponse> {
  constructor(
    public readonly lifeCycleCashFlowId: string,
    public readonly asset: string,
    public readonly pageIndex: number,
    public readonly pageLength: number,
    public readonly distributionId: string,
    public readonly paymentTokenDecimals: number,
  ) {
    super();
  }
}
