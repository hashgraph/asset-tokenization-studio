// SPDX-License-Identifier: Apache-2.0

import BigDecimal from "../shared/BigDecimal";
import { Coupon } from "./Coupon";
import { CouponAmountFor } from "./CouponAmountFor";

export class CouponFor {
  tokenBalance: BigDecimal;
  nominalValue: BigDecimal;
  decimals: number;
  recordDateReached: boolean;
  coupon: Coupon;
  couponAmount: CouponAmountFor;
  isDisabled: boolean;

  constructor(
    tokenBalance: BigDecimal,
    nominalValue: BigDecimal,
    decimals: number,
    recordDateReached: boolean,
    coupon: Coupon,
    couponAmount: CouponAmountFor,
    isDisabled: boolean = false,
  ) {
    this.tokenBalance = tokenBalance;
    this.nominalValue = nominalValue;
    this.decimals = decimals;
    this.recordDateReached = recordDateReached;
    this.coupon = coupon;
    this.couponAmount = couponAmount;
    this.isDisabled = isDisabled;
  }
}
