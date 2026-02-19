// SPDX-License-Identifier: Apache-2.0

import BaseError from "@core/error/BaseError";
import ValidatedDomain from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";
import { InvalidNegativeRate } from "./error/InvalidNegativeRate";

export class ImpactData extends ValidatedDomain<ImpactData> {
  maxDeviationCap: number;
  baseLine: number;
  maxDeviationFloor: number;
  impactDataDecimals: number;
  adjustmentPrecision: number;

  constructor(
    maxDeviationCap: number,
    baseLine: number,
    maxDeviationFloor: number,
    impactDataDecimals: number,
    adjustmentPrecision: number,
  ) {
    super({
      baseLine: FormatValidation.checkNumber({
        max: maxDeviationCap,
        min: maxDeviationFloor,
      }),
      impactDataDecimals: (_) => {
        return ImpactData.checkRate(this.impactDataDecimals);
      },
    });

    this.maxDeviationCap = maxDeviationCap;
    this.baseLine = baseLine;
    this.maxDeviationFloor = maxDeviationFloor;
    this.impactDataDecimals = impactDataDecimals;
    this.adjustmentPrecision = adjustmentPrecision;

    ValidatedDomain.handleValidation(ImpactData.name, this);
  }

  public static checkRate(value: number): BaseError[] {
    const errorList: BaseError[] = [];

    if (value < 0) {
      errorList.push(new InvalidNegativeRate(value));
    }

    return errorList;
  }
}
