export enum DividendType {
  NONE = "None",
  PREFERRED = "Preferred",
  COMMON = "Common",
}

export function transformDividendType(value: string): DividendType {
  switch (value) {
    case "0":
      return DividendType.NONE;
    case "1":
      return DividendType.PREFERRED;
    case "2":
      return DividendType.COMMON;
    default:
      throw new Error(`Unknown value: ${value}`);
  }
}
