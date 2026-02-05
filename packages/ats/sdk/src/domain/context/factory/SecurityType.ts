// SPDX-License-Identifier: Apache-2.0

export enum SecurityType {
  BOND_VARIABLE_RATE = "BOND_VARIABLE_RATE",
  EQUITY = "EQUITY",
  BOND_FIXED_RATE = "BOND_FIXED_RATE",
  BOND_KPI_LINKED_RATE = "BOND_KPI_LINKED_RATE",
  BOND_SPT_RATE = "BOND_SPT_RATE",
}

export class CastSecurityType {
  static fromNumber(id: number): SecurityType {
    switch (id) {
      case 0:
        return SecurityType.BOND_VARIABLE_RATE;
      case 1:
        return SecurityType.EQUITY;
      case 2:
        return SecurityType.BOND_FIXED_RATE;
      case 3:
        return SecurityType.BOND_KPI_LINKED_RATE;
      case 4:
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
