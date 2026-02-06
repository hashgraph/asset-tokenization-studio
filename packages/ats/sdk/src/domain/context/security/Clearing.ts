// SPDX-License-Identifier: Apache-2.0

import BigDecimal from "../shared/BigDecimal";
import {
  InvalidClearingOperationType,
  InvalidClearingOperationTypeNumber,
} from "./error/values/InvalidClearingOperationType";

export class ClearingOperation {
  partition: string;
  expirationTimestamp: bigint;
  data: string;
}

export class ClearingOperationFrom {
  clearingOperation: ClearingOperation;
  from: string;
  operatorData: string;
}

export class ProtectedClearingOperation {
  clearingOperation: ClearingOperation;
  from: string;
  deadline: bigint;
  nonce: bigint;
}

export class ClearingOperationIdentifier {
  partition: string;
  tokenHolder: string;
  clearingOperationType: ClearingOperationType;
  clearingId: number;
}

export enum ClearingOperationType {
  Transfer,
  Redeem,
  HoldCreation,
}

export class CastClearingOperationType {
  static fromBigint(id: bigint): ClearingOperationType {
    switch (id) {
      case 0n:
        return ClearingOperationType.Transfer;
      case 1n:
        return ClearingOperationType.Redeem;
      case 2n:
        return ClearingOperationType.HoldCreation;
      default:
        throw new InvalidClearingOperationTypeNumber(Number(id));
    }
  }

  static toNumber(value: ClearingOperationType): number {
    switch (value) {
      case ClearingOperationType.Transfer:
        return 0;
      case ClearingOperationType.Redeem:
        return 1;
      case ClearingOperationType.HoldCreation:
        return 2;
      default:
        throw new InvalidClearingOperationType(value);
    }
  }
}
export class ClearingHoldCreation {
  amount: BigDecimal;
  expirationTimestamp: number;
  data: string;
  operatorData: string;
  holdEscrowId: string;
  holdExpirationTimestamp: number;
  holdTo: string;
  holdData: string;
  constructor(
    amount: BigDecimal,
    expirationTimestamp: number,
    data: string,
    operatorData: string,
    holdEscrowId: string,
    holdExpirationTimestamp: number,
    holdTo: string,
    holdData: string,
  ) {
    this.amount = amount;
    this.expirationTimestamp = expirationTimestamp;
    this.data = data;
    this.operatorData = operatorData;
    this.holdEscrowId = holdEscrowId;
    this.holdExpirationTimestamp = holdExpirationTimestamp;
    this.holdTo = holdTo;
    this.holdData = holdData;
  }
}

export class ClearingRedeem {
  amount: BigDecimal;
  expirationTimestamp: number;
  data: string;
  operatorData: string;
  constructor(amount: BigDecimal, expirationTimestamp: number, data: string, operatorData: string) {
    this.amount = amount;
    this.expirationTimestamp = expirationTimestamp;
    this.data = data;
    this.operatorData = operatorData;
  }
}

export class ClearingTransfer {
  amount: BigDecimal;
  expirationTimestamp: number;
  destination: string;
  data: string;
  operatorData: string;
  constructor(
    amount: BigDecimal,
    expirationTimestamp: number,
    destination: string,
    data: string,
    operatorData: string,
  ) {
    this.expirationTimestamp = expirationTimestamp;
    this.amount = amount;
    this.destination = destination;
    this.data = data;
    this.operatorData = operatorData;
  }
}
