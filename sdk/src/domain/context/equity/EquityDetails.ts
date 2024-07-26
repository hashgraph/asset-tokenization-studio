import BigDecimal from '../shared/BigDecimal.js';
import { DividendType } from './DividendType.js';

export class EquityDetails {
  votingRight: boolean;
  informationRight: boolean;
  liquidationRight: boolean;
  subscriptionRight: boolean;
  convertionRight: boolean;
  redemptionRight: boolean;
  putRight: boolean;
  dividendRight: DividendType;
  currency: string;
  nominalValue: BigDecimal;

  constructor(
    votingRight: boolean,
    informationRight: boolean,
    liquidationRight: boolean,
    subscriptionRight: boolean,
    convertionRight: boolean,
    redemptionRight: boolean,
    putRight: boolean,
    dividendRight: DividendType,
    currency: string,
    nominalValue: BigDecimal,
  ) {
    this.votingRight = votingRight;
    this.informationRight = informationRight;
    this.liquidationRight = liquidationRight;
    this.subscriptionRight = subscriptionRight;
    this.convertionRight = convertionRight;
    this.redemptionRight = redemptionRight;
    this.putRight = putRight;
    this.dividendRight = dividendRight;
    this.currency = currency;
    this.nominalValue = nominalValue;
  }
}
