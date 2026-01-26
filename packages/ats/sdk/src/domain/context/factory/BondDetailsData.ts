// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import { SecurityDate } from "../shared/SecurityDate";

export class BondDetailsData extends ValidatedDomain<BondDetailsData> {
  public currency: string;
  public nominalValue: string;
  public nominalValueDecimals: number;
  public startingDate: string;
  public maturityDate: string;

  constructor(
    currency: string,
    nominalValue: string,
    nominalValueDecimals: number,
    startingDate: string,
    maturityDate: string,
  ) {
    super({
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), parseInt(this.startingDate));
      },
    });

    this.currency = currency;
    this.nominalValue = nominalValue;
    this.nominalValueDecimals = nominalValueDecimals;
    this.startingDate = startingDate;
    this.maturityDate = maturityDate;

    ValidatedDomain.handleValidation(BondDetailsData.name, this);
  }
}
