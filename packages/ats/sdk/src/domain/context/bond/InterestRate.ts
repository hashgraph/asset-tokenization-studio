// SPDX-License-Identifier: Apache-2.0

import BaseError from "@core/error/BaseError";
import ValidatedDomain from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";
import { InvalidNegativeRate } from "./error/InvalidNegativeRate";

export class InterestRate extends ValidatedDomain<InterestRate> {
  maxRate: number;
  baseRate: number;
  minRate: number;
  startPeriod: number;
  startRate: number;
  missedPenalty: number;
  reportPeriod: number;
  rateDecimals: number;

  constructor(
    maxRate: number,
    baseRate: number,
    minRate: number,
    startPeriod: number,
    startRate: number,
    missedPenalty: number,
    reportPeriod: number,
    rateDecimals: number,
  ) {
    super({
      baseRate: FormatValidation.checkNumber({
        max: maxRate,
        min: minRate,
      }),
      rateDecimals: (_) => {
        return InterestRate.checkRate(this.rateDecimals);
      },
    });

    this.maxRate = maxRate;
    this.baseRate = baseRate;
    this.minRate = minRate;
    this.startPeriod = startPeriod;
    this.startRate = startRate;
    this.missedPenalty = missedPenalty;
    this.reportPeriod = reportPeriod;
    this.rateDecimals = rateDecimals;

    ValidatedDomain.handleValidation(InterestRate.name, this);
  }

  public static checkRate(value: number): BaseError[] {
    const errorList: BaseError[] = [];

    if (value < 0) {
      errorList.push(new InvalidNegativeRate(value));
    }

    return errorList;
  }
}
