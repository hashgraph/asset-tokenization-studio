// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ExecuteBondCashOutByAddressesCommandResponse implements CommandResponse {
  constructor(
    public readonly failed: string[],
    public readonly succeeded: string[],
    public readonly paidAmount: string[],
    public readonly transactionId: string,
  ) {}
}

export class ExecuteBondCashOutByAddressesCommand extends Command<ExecuteBondCashOutByAddressesCommandResponse> {
  constructor(
    public readonly lifeCycleCashFlowId: string,
    public readonly bond: string,
    public readonly holders: string[],
    public readonly paymentTokenDecimals: number,
  ) {
    super();
  }
}
