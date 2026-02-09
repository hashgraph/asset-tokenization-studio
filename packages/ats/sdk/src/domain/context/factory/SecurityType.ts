// SPDX-License-Identifier: Apache-2.0

export enum SecurityType {
  BOND = "BOND",
  EQUITY = "EQUITY",
}

export class CastSecurityType {
  static fromBigint(id: bigint): SecurityType {
    if (id == 0n) return SecurityType.BOND;
    return SecurityType.EQUITY;
  }

  static toNumber(value: SecurityType): number {
    if (value == SecurityType.BOND) return 0;
    return 1;
  }
}
