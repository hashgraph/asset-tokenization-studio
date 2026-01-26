// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from "ethers";
import BigDecimal from "../shared/BigDecimal";

export class Hold {
  public amount: BigNumber;
  public expirationTimestamp: BigNumber;
  public escrow: string;
  public to: string;
  public data: string;
}

export class ProtectedHold {
  public hold: Hold;
  public deadline: BigNumber;
  public nonce: BigNumber;
}

export class HoldIdentifier {
  public partition: string;
  public tokenHolder: string;
  public holdId: number;
}

export class HoldDetails {
  expirationTimeStamp: number;
  amount: BigDecimal;
  escrowAddress: string;
  tokenHolderAddress: string;
  destinationAddress: string;
  data: string;
  operatorData: string;
  constructor(
    executionTimeStamp: number,
    amount: BigDecimal,
    escrowAddress: string,
    tokenHolderAddress: string,
    destinationAddress: string,
    data: string,
    operatorData: string,
  ) {
    this.expirationTimeStamp = executionTimeStamp;
    this.amount = amount;
    this.escrowAddress = escrowAddress;
    this.tokenHolderAddress = tokenHolderAddress;
    this.destinationAddress = destinationAddress;
    this.data = data;
    this.operatorData = operatorData;
  }
}
