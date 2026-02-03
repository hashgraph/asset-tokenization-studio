// SPDX-License-Identifier: Apache-2.0

import BigDecimal from "../shared/BigDecimal";

export class VotingFor {
  tokenBalance: BigDecimal;
  decimals: number;
  constructor(tokenBalance: BigDecimal, decimals: number) {
    this.tokenBalance = tokenBalance;
    this.decimals = decimals;
  }
}
