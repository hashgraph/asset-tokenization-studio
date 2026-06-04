// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import { ImpactData } from "../bond/ImpactData";
import { InterestRate } from "../bond/InterestRate";
import { SecurityDate } from "../shared/SecurityDate";
import { OptionalField } from "@core/decorator/OptionalDecorator";

export class BondKpiLinkedRateDetailsData extends ValidatedDomain<BondKpiLinkedRateDetailsData> {
  public currency: string;
  public nominalValue: string;
  public nominalValueDecimals: number;
  @OptionalField()
  public startingDate?: string;
  public maturityDate: string;
  public interestRate: InterestRate;
  public impactData: ImpactData;

  constructor(
    currency: string,
    nominalValue: string,
    nominalValueDecimals: number,
    startingDate: string | undefined,
    maturityDate: string,
    interestRate: InterestRate,
    impactData: ImpactData,
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
    this.interestRate = interestRate;
    this.impactData = impactData;

    ValidatedDomain.handleValidation(BondKpiLinkedRateDetailsData.name, this);
  }
}
