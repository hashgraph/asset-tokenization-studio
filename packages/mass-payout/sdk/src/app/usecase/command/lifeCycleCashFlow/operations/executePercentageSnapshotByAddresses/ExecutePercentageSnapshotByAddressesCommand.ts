// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class ExecutePercentageSnapshotByAddressesCommandResponse implements CommandResponse {
  constructor(
    public readonly failed: string[],
    public readonly succeeded: string[],
    public readonly paidAmount: string[],
    public readonly transactionId: string,
  ) {}
}

// eslint-disable-next-line max-len
export class ExecutePercentageSnapshotByAddressesCommand extends Command<ExecutePercentageSnapshotByAddressesCommandResponse> {
  constructor(
    public readonly lifeCycleCashFlowId: string,
    public readonly asset: string,
    public readonly snapshotId: string,
    public readonly holders: string[],
    public readonly percentage: string,
    public readonly paymentTokenDecimals: number,
  ) {
    super();
  }
}
