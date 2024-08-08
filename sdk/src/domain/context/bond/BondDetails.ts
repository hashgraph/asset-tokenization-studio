import BigDecimal from '../shared/BigDecimal.js';

export class BondDetails {
  currency: string;
  nominalValue: BigDecimal;
  startingDate: number;
  maturityDate: number;

  constructor(
    currency: string,
    nominalValue: BigDecimal,
    startingDate: number,
    maturityDate: number,
  ) {
    this.currency = currency;
    this.nominalValue = nominalValue;
    this.startingDate = startingDate;
    this.maturityDate = maturityDate;
  }
}
