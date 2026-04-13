// SPDX-License-Identifier: Apache-2.0

import BigDecimal from "../shared/BigDecimal";

export class AmortizationFor {
  account: string;
  recordDate: number;
  executionDate: number;
  holdId: number;
  holdActive: boolean;
  tokenHeldAmount: BigDecimal;
  decimalsHeld: number;
  abafAtHold: BigDecimal;
  tokenBalance: BigDecimal;
  decimalsBalance: number;
  recordDateReached: boolean;
  abafAtSnapshot: BigDecimal;
  nominalValue: BigDecimal;
  nominalValueDecimals: number;

  constructor(
    account: string,
    recordDate: number,
    executionDate: number,
    holdId: number,
    holdActive: boolean,
    tokenHeldAmount: BigDecimal,
    decimalsHeld: number,
    abafAtHold: BigDecimal,
    tokenBalance: BigDecimal,
    decimalsBalance: number,
    recordDateReached: boolean,
    abafAtSnapshot: BigDecimal,
    nominalValue: BigDecimal,
    nominalValueDecimals: number,
  ) {
    this.account = account;
    this.recordDate = recordDate;
    this.executionDate = executionDate;
    this.holdId = holdId;
    this.holdActive = holdActive;
    this.tokenHeldAmount = tokenHeldAmount;
    this.decimalsHeld = decimalsHeld;
    this.abafAtHold = abafAtHold;
    this.tokenBalance = tokenBalance;
    this.decimalsBalance = decimalsBalance;
    this.recordDateReached = recordDateReached;
    this.abafAtSnapshot = abafAtSnapshot;
    this.nominalValue = nominalValue;
    this.nominalValueDecimals = nominalValueDecimals;
  }
}
