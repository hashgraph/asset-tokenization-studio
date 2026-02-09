// SPDX-License-Identifier: Apache-2.0

export enum RateStatus {
  PENDING = "PENDING",
  SET = "SET",
}

export class CastRateStatus {
  static fromBigint(id: bigint): RateStatus {
    return this.fromNumber(Number(id));
  }

  static fromNumber(value: number): RateStatus {
    return value === 0 ? RateStatus.PENDING : RateStatus.SET;
  }

  static toNumber(value: RateStatus): number {
    if (value == RateStatus.PENDING) return 0;
    return 1;
  }
}
