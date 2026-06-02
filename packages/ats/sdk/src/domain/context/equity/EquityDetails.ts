// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import BigDecimal from "../shared/BigDecimal";
import { DividendType } from "./DividendType";
import { Equity } from "./Equity";
import { OptionalField } from "@core/decorator/OptionalDecorator";

export class EquityDetails extends ValidatedDomain<EquityDetails> {
  @OptionalField()
  votingRight?: boolean;
  @OptionalField()
  informationRight?: boolean;
  @OptionalField()
  liquidationRight?: boolean;
  @OptionalField()
  subscriptionRight?: boolean;
  @OptionalField()
  conversionRight?: boolean;
  @OptionalField()
  redemptionRight?: boolean;
  @OptionalField()
  putRight?: boolean;
  @OptionalField()
  dividendRight?: DividendType;
  currency: string;
  nominalValue: BigDecimal;
  nominalValueDecimals: number;

  constructor(
    votingRight: boolean | undefined,
    informationRight: boolean | undefined,
    liquidationRight: boolean | undefined,
    subscriptionRight: boolean | undefined,
    conversionRight: boolean | undefined,
    redemptionRight: boolean | undefined,
    putRight: boolean | undefined,
    dividendRight: DividendType | undefined,
    currency: string,
    nominalValue: BigDecimal,
    nominalValueDecimals: number,
  ) {
    super({
      dividendRight: (val) => {
        return Equity.checkDividend(val!);
      },
    });
    this.votingRight = votingRight;
    this.informationRight = informationRight;
    this.liquidationRight = liquidationRight;
    this.subscriptionRight = subscriptionRight;
    this.conversionRight = conversionRight;
    this.redemptionRight = redemptionRight;
    this.putRight = putRight;
    this.dividendRight = dividendRight;
    this.currency = currency;
    this.nominalValue = nominalValue;
    this.nominalValueDecimals = nominalValueDecimals;

    ValidatedDomain.handleValidation(EquityDetails.name, this);
  }
}
