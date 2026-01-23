// SPDX-License-Identifier: Apache-2.0

export enum RateStatus {
  PENDING = "PENDING",
  SET = "SET",
}

export class CastRateStatus {
  static fromNumber(id: number): RateStatus {
    if (id == 0) return RateStatus.PENDING;
    return RateStatus.SET;
  }

  static toNumber(value: RateStatus): number {
    if (value == RateStatus.PENDING) return 0;
    return 1;
  }
}
