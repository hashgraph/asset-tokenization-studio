// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ExecuteDistributionByAddressesCommandResponse implements CommandResponse {
  constructor(
    public readonly failed: string[],
    public readonly succeeded: string[],
    public readonly paidAmount: string[],
    public readonly transactionId: string,
  ) {}
}

export class ExecuteDistributionByAddressesCommand extends Command<ExecuteDistributionByAddressesCommandResponse> {
  constructor(
    public readonly lifeCycleCashFlowId: string,
    public readonly asset: string,
    public readonly holders: string[],
    public readonly distributionId: string,
    public readonly paymentTokenDecimals: number,
  ) {
    super();
  }
}
