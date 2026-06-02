// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import BigDecimal from "../shared/BigDecimal";
import { SecurityDate } from "../shared/SecurityDate";
import { OptionalField } from "@core/decorator/OptionalDecorator";

export class BondDetails extends ValidatedDomain<BondDetails> {
  currency: string;
  nominalValue: BigDecimal;
  nominalValueDecimals: number;
  @OptionalField()
  startingDate?: number;
  maturityDate: number;

  constructor(
    currency: string,
    nominalValue: BigDecimal,
    nominalValueDecimals: number,
    startingDate: number | undefined,
    maturityDate: number,
  ) {
    super({
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(val, this.startingDate);
      },
    });

    this.currency = currency;
    this.nominalValue = nominalValue;
    this.nominalValueDecimals = nominalValueDecimals;
    this.startingDate = startingDate;
    this.maturityDate = maturityDate;

    ValidatedDomain.handleValidation(BondDetails.name, this);
  }
}
