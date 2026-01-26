// SPDX-License-Identifier: Apache-2.0

export class CouponAmountFor {
  numerator: string;
  denominator: string;
  recordDateReached: boolean;
  constructor(numerator: string, denominator: string, recordDateReached: boolean) {
    this.numerator = numerator;
    this.denominator = denominator;
    this.recordDateReached = recordDateReached;
  }
}
