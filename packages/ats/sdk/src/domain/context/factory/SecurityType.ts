// SPDX-License-Identifier: Apache-2.0

export enum SecurityType {
  BOND = "BOND",
  EQUITY = "EQUITY",
}

export class CastSecurityType {
  static fromNumber(id: number): SecurityType {
    if (id == 0) return SecurityType.BOND;
    return SecurityType.EQUITY;
  }

  static toNumber(value: SecurityType): number {
    if (value == SecurityType.BOND) return 0;
    return 1;
  }
}
