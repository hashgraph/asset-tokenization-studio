// SPDX-License-Identifier: Apache-2.0

import BigDecimal from "../shared/BigDecimal";

export class CouponDetails {
  couponFrequency: number;
  couponRate: BigDecimal;
  couponRateDecimals: number;
  firstCouponDate: number;

  constructor(couponFrequency: number, couponRate: BigDecimal, couponRateDecimals: number, firstCouponDate: number) {
    this.couponFrequency = couponFrequency;
    this.couponRate = couponRate;
    this.couponRateDecimals = couponRateDecimals;
    this.firstCouponDate = firstCouponDate;
  }
}
