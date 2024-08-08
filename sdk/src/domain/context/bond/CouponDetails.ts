import BigDecimal from '../shared/BigDecimal.js';

export class CouponDetails {
  couponFrequency: number;
  couponRate: BigDecimal;
  firstCouponDate: number;

  constructor(
    couponFrequency: number,
    couponRate: BigDecimal,
    firstCouponDate: number,
  ) {
    this.couponFrequency = couponFrequency;
    this.couponRate = couponRate;
    this.firstCouponDate = firstCouponDate;
  }
}
