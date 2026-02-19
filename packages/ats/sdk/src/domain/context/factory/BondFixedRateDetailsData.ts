// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import { SecurityDate } from "../shared/SecurityDate";
import { BondFixedRateDetails } from "../bond/BondFixedRateDetails";

export class BondFixedRateDetailsData extends ValidatedDomain<BondFixedRateDetailsData> {
  public currency: string;
  public nominalValue: string;
  public nominalValueDecimals: number;
  public startingDate: string;
  public maturityDate: string;
  public rate: number;
  public rateDecimals: number;

  constructor(
    currency: string,
    nominalValue: string,
    nominalValueDecimals: number,
    startingDate: string,
    maturityDate: string,
    rate: number,
    rateDecimals: number,
  ) {
    super({
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), parseInt(this.startingDate));
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

    ValidatedDomain.handleValidation(BondFixedRateDetailsData.name, this);
  }
}
