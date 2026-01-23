// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ExecuteBondCashOutCommandResponse implements CommandResponse {
  constructor(
    public readonly failed: string[],
    public readonly succeeded: string[],
    public readonly paidAmount: string[],
    public readonly executed: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ExecuteBondCashOutCommand extends Command<ExecuteBondCashOutCommandResponse> {
  constructor(
    public readonly lifeCycleCashFlowId: string,
    public readonly bond: string,
    public readonly pageIndex: number,
    public readonly pageLength: number,
    public readonly paymentTokenDecimals: number,
  ) {
    super();
  }
}
