// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import { SecurityDate } from "../shared/SecurityDate";
import { OptionalField } from "@core/decorator/OptionalDecorator";

export class BondDetailsData extends ValidatedDomain<BondDetailsData> {
  public currency: string;
  public nominalValue: string;
  public nominalValueDecimals: number;
  @OptionalField()
  public startingDate?: string;
  public maturityDate: string;

  constructor(
    currency: string,
    nominalValue: string,
    nominalValueDecimals: number,
    startingDate: string | undefined,
    maturityDate: string,
  ) {
    super({
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          this.startingDate !== undefined ? parseInt(this.startingDate) : undefined,
        );
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
