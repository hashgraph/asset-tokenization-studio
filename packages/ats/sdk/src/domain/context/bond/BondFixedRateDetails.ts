// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import BigDecimal from "../shared/BigDecimal";
import { SecurityDate } from "../shared/SecurityDate";
import BaseError from "@core/error/BaseError";
import { InvalidNegativeRate } from "./error/InvalidNegativeRate";

export class BondFixedRateDetails extends ValidatedDomain<BondFixedRateDetails> {
  currency: string;
  nominalValue: BigDecimal;
  nominalValueDecimals: number;
  startingDate: number;
  maturityDate: number;
  rate: number;
  rateDecimals: number;

  constructor(
    currency: string,
    nominalValue: BigDecimal,
    nominalValueDecimals: number,
    startingDate: number,
    maturityDate: number,
    rate: number,
    rateDecimals: number,
  ) {
    super({
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(val, this.startingDate);
      },
      rateDecimals: (_) => {
        return BondFixedRateDetails.checkRate(this.rateDecimals);
      },
    });

    this.currency = currency;
    this.nominalValue = nominalValue;
    this.nominalValueDecimals = nominalValueDecimals;
    this.startingDate = startingDate;
    this.maturityDate = maturityDate;
    this.rate = rate;
    this.rateDecimals = rateDecimals;

    ValidatedDomain.handleValidation(BondFixedRateDetails.name, this);
  }

  public static checkRate(value: number): BaseError[] {
    const errorList: BaseError[] = [];

    if (value < 0) {
      errorList.push(new InvalidNegativeRate(value));
    }

    return errorList;
  }
}
