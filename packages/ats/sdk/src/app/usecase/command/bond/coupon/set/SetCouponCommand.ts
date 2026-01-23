// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import { RateStatus } from "@domain/context/bond/RateStatus.js";

export class SetCouponCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class SetCouponCommand extends Command<SetCouponCommandResponse> {
  constructor(
    public readonly address: string,
    public readonly recordDate: string,
    public readonly executionDate: string,
    public readonly rate: string,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly fixingDate: string,
    public readonly rateStatus: RateStatus,
  ) {
    super();
  }
}
