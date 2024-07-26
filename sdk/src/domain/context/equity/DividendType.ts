export enum DividendType {
  NONE = 'NONE',
  PREFERRED = 'PREFERRED',
  COMMON = 'COMMON',
}

export class CastDividendType {
  static fromNumber(id: number): DividendType {
    if (id == 0) return DividendType.NONE;
    if (id == 1) return DividendType.PREFERRED;
    return DividendType.COMMON;
  }

  static toNumber(value: DividendType): number {
    if (value == DividendType.NONE) return 0;
    if (value == DividendType.PREFERRED) return 1;
    return 2;
  }
}
