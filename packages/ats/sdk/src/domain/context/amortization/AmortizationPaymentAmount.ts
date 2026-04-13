// SPDX-License-Identifier: Apache-2.0

import BigDecimal from "../shared/BigDecimal";

export class AmortizationPaymentAmount {
  tokenAmount: BigDecimal;
  decimals: number;

  constructor(tokenAmount: BigDecimal, decimals: number) {
    this.tokenAmount = tokenAmount;
    this.decimals = decimals;
  }
}
