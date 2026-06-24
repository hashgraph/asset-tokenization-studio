// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import BigDecimal from "../shared/BigDecimal";
import { SecurityDate } from "../shared/SecurityDate";
import { ImpactData } from "./ImpactData";
import { InterestRate } from "./InterestRate";
import { OptionalField } from "@core/decorator/OptionalDecorator";

export class BondKpiLinkedRateDetails extends ValidatedDomain<BondKpiLinkedRateDetails> {
  currency: string;
  nominalValue: BigDecimal;
  nominalValueDecimals: number;
  @OptionalField()
  startingDate?: number;
  maturityDate: number;
  interestRate: InterestRate;
  impactData: ImpactData;

  constructor(
    currency: string,
    nominalValue: BigDecimal,
    nominalValueDecimals: number,
    startingDate: number | undefined,
    maturityDate: number,
    interestRate: InterestRate,
    impactData: ImpactData,
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
    this.interestRate = interestRate;
    this.impactData = impactData;

    ValidatedDomain.handleValidation(BondKpiLinkedRateDetails.name, this);
  }
}
