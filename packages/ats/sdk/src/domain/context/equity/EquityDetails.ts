// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import BigDecimal from "../shared/BigDecimal";
import { DividendType } from "./DividendType";
import { Equity } from "./Equity";

export class EquityDetails extends ValidatedDomain<EquityDetails> {
  votingRight: boolean;
  informationRight: boolean;
  liquidationRight: boolean;
  subscriptionRight: boolean;
  conversionRight: boolean;
  redemptionRight: boolean;
  putRight: boolean;
  dividendRight: DividendType;
  currency: string;
  nominalValue: BigDecimal;
  nominalValueDecimals: number;

  constructor(
    votingRight: boolean,
    informationRight: boolean,
    liquidationRight: boolean,
    subscriptionRight: boolean,
    conversionRight: boolean,
    redemptionRight: boolean,
    putRight: boolean,
    dividendRight: DividendType,
    currency: string,
    nominalValue: BigDecimal,
    nominalValueDecimals: number,
  ) {
    super({
      dividendRight: (val) => {
        return Equity.checkDividend(val);
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
