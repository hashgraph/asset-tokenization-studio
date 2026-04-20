// SPDX-License-Identifier: Apache-2.0

import BigDecimal from "../shared/BigDecimal";

export class Amortization {
  recordDate: number;
  executionDate: number;
  tokensToRedeem: BigDecimal;

  constructor(recordDate: number, executionDate: number, tokensToRedeem: BigDecimal) {
    this.recordDate = recordDate;
    this.executionDate = executionDate;
    this.tokensToRedeem = tokensToRedeem;
  }
}
