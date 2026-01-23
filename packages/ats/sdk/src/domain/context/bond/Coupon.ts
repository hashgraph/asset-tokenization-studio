// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import BigDecimal from "../shared/BigDecimal";
import { SecurityDate } from "../shared/SecurityDate";
import { RateStatus } from "./RateStatus";
import { Bond } from "./Bond";

export class Coupon extends ValidatedDomain<Coupon> {
  recordTimeStamp: number;
  executionTimeStamp: number;
  rate: BigDecimal;
  rateDecimals: number;
  startTimeStamp: number;
  endTimeStamp: number;
  fixingTimeStamp: number;
  rateStatus: RateStatus;
  snapshotId?: number;

  constructor(
    recordTimeStamp: number,
    executionTimeStamp: number,
    rate: BigDecimal,
    rateDecimals: number,
    startTimeStamp: number,
    endTimeStamp: number,
    fixingTimeStamp: number,
    rateStatus: RateStatus,
    snapshotId?: number,
  ) {
    super({
      executionTimeStamp: (val) => {
        return SecurityDate.checkDateTimestamp(val, this.recordTimeStamp);
      },
      rateStatus: (val) => {
        return Bond.checkRateStatus(val);
      },
    });

    this.recordTimeStamp = recordTimeStamp;
    this.executionTimeStamp = executionTimeStamp;
    this.rate = rate;
    this.rateDecimals = rateDecimals;
    this.startTimeStamp = startTimeStamp;
    this.endTimeStamp = endTimeStamp;
    this.fixingTimeStamp = fixingTimeStamp;
    this.rateStatus = rateStatus;
    this.snapshotId = snapshotId ? snapshotId : undefined;

    ValidatedDomain.handleValidation(Coupon.name, this);
  }
}
