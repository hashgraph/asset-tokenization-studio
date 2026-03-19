// SPDX-License-Identifier: Apache-2.0

import BigDecimal from "../shared/BigDecimal";

export class VotingFor {
  tokenBalance: BigDecimal;
  decimals: number;
  isDisabled: boolean;
  constructor(tokenBalance: BigDecimal, decimals: number, isDisabled: boolean = false) {
    this.tokenBalance = tokenBalance;
    this.decimals = decimals;
    this.isDisabled = isDisabled;
  }
}
