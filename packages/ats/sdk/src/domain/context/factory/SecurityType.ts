// SPDX-License-Identifier: Apache-2.0

export enum SecurityType {
  BOND_VARIABLE_RATE = "BOND_VARIABLE_RATE",
  EQUITY = "EQUITY",
  BOND_FIXED_RATE = "BOND_FIXED_RATE",
  BOND_KPI_LINKED_RATE = "BOND_KPI_LINKED_RATE",
  BOND_SPT_RATE = "BOND_SPT_RATE",
}

export class CastSecurityType {
  static fromBigint(id: bigint): SecurityType {
    switch (id) {
      case 0n:
        return SecurityType.BOND_VARIABLE_RATE;
      case 1n:
        return SecurityType.EQUITY;
      case 2n:
        return SecurityType.BOND_FIXED_RATE;
      case 3n:
        return SecurityType.BOND_KPI_LINKED_RATE;
      case 4n:
        return SecurityType.BOND_SPT_RATE;
      default:
        return SecurityType.BOND_VARIABLE_RATE;
    }
  }

  static toNumber(value: SecurityType): number {
    switch (value) {
      case SecurityType.BOND_VARIABLE_RATE:
        return 0;
      case SecurityType.EQUITY:
        return 1;
      case SecurityType.BOND_FIXED_RATE:
        return 2;
      case SecurityType.BOND_KPI_LINKED_RATE:
        return 3;
      case SecurityType.BOND_SPT_RATE:
        return 4;
      default:
        return 0;
    }
  }
}
