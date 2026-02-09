// SPDX-License-Identifier: Apache-2.0

import { FixedNumber, parseUnits } from "ethers";
import CheckNums from "@core/checks/numbers/CheckNums";
import { Long } from "@hiero-ledger/sdk";

export type BigDecimalFormat = string | number | undefined;

const SEPARATOR = ".";
export default class BigDecimal {
  #fn: FixedNumber;
  #decimals: number;

  public get format(): { decimals: number } {
    return { decimals: this.#decimals };
  }

  public get value(): string {
    return this.#fn.toString();
  }

  public get decimals(): number {
    return this.#decimals;
  }

  public static ZERO: BigDecimal = BigDecimal.fromString("0", 0);
  public static MINUSONE: BigDecimal = BigDecimal.fromString("-1", 0);

  constructor(value: string | bigint, format?: BigDecimalFormat, decimals?: number) {
    const dec = typeof format === "number" ? format : (decimals ?? 0);
    this.#decimals = dec;
    if (typeof value === "string") {
      this.#fn = FixedNumber.fromString(value, dec);
    } else {
      this.#fn = FixedNumber.fromValue(value, dec);
    }
  }

  addUnsafe(other: BigDecimal): BigDecimal {
    const result = this.#fn.add(other.#fn);
    return BigDecimal.fromString(result.toString(), Math.max(this.#decimals, other.#decimals));
  }

  subUnsafe(other: BigDecimal): BigDecimal {
    const result = this.#fn.sub(other.#fn);
    return BigDecimal.fromString(result.toString(), Math.max(this.#decimals, other.#decimals));
  }

  mulUnsafe(other: BigDecimal): BigDecimal {
    const result = this.#fn.mul(other.#fn);
    return BigDecimal.fromString(result.toString(), Math.max(this.#decimals, other.#decimals));
  }

  divUnsafe(other: BigDecimal): BigDecimal {
    const result = this.#fn.div(other.#fn);
    return BigDecimal.fromString(result.toString(), Math.max(this.#decimals, other.#decimals));
  }

  floor(): BigDecimal {
    const result = this.#fn.floor();
    return BigDecimal.fromString(result.toString(), this.#decimals);
  }

  ceiling(): BigDecimal {
    const result = this.#fn.ceiling();
    return BigDecimal.fromString(result.toString(), this.#decimals);
  }

  round(decimals?: number | undefined): BigDecimal {
    const result = this.#fn.round(decimals ?? 0);
    return BigDecimal.fromString(result.toString(), decimals ?? this.#decimals);
  }

  isZero(): boolean {
    return this.#fn.isZero();
  }

  isNegative(): boolean {
    return this.#fn.isNegative();
  }

  toUnsafeFloat(): number {
    return this.#fn.toUnsafeFloat();
  }

  public isGreaterOrEqualThan(other: BigDecimal): boolean {
    return this.#fn.cmp(other.#fn) >= 0;
  }

  public isGreaterThan(other: BigDecimal): boolean {
    return this.#fn.cmp(other.#fn) > 0;
  }

  public isLowerThan(other: BigDecimal): boolean {
    return this.#fn.cmp(other.#fn) < 0;
  }

  public isLowerOrEqualThan(other: BigDecimal): boolean {
    return this.#fn.cmp(other.#fn) <= 0;
  }

  public isEqualThan(other: BigDecimal): boolean {
    return this.#fn.cmp(other.#fn) === 0;
  }

  public toBigInt(): bigint {
    return parseUnits(this.value, this.#decimals);
  }

  public toFixedNumber(): string {
    return this.toBigInt().toString();
  }

  public toHexString(): string {
    const bigIntValue = this.toBigInt();
    return "0x" + bigIntValue.toString(16);
  }

  public toString(): string {
    let number = this.#fn.toString();
    if (number.endsWith(".0")) {
      number = number.substring(0, number.length - 2);
    }
    return number;
  }

  public setDecimals(value: number): BigDecimal {
    // eslint-disable-next-line prefer-const
    let [int, float] = this.value.split(SEPARATOR);
    if (float && float.length && float.length > value) {
      float = float.substring(0, float.length - value);
      return BigDecimal.fromString(`${int}${SEPARATOR}${float}`, Math.max(float?.length ?? 0, value));
    } else {
      return BigDecimal.fromString(int, Math.max(0, value));
    }
  }

  private splitNumber(): string[] {
    const splitNumber = this.#fn.toString().split(".");
    if (splitNumber.length > 1) {
      splitNumber[1] = splitNumber[1].padEnd(this.#decimals, "0");
    } else {
      splitNumber[1] = "";
    }
    return splitNumber;
  }

  static getDecimalsFromString(val: string): number {
    if (val.length === 0) return 0;
    const [, dec] = val.split(SEPARATOR);
    if (!dec) return 0;
    if (!CheckNums.isNumber(dec)) return 0;
    return (dec as string).replace(/\.0+$/, "").length;
  }

  public toLong(): Long {
    const number = this.splitNumber();
    return Long.fromString(number[0] + number[1]);
  }

  static fromString(value: string, format?: string | number | undefined): BigDecimal {
    if (format === undefined) {
      format = this.getDecimalsFromString(value);
    }
    return new BigDecimal(value, format);
  }

  static fromStringFixed(value: string, decimals: number): BigDecimal {
    if (value.length < decimals) {
      value = "0." + value.padStart(decimals - value.length + 1, "0");
    } else {
      const position = value.length - decimals;
      value = value.substring(0, position) + "." + value.substring(position);
    }
    return new BigDecimal(value, decimals);
  }

  static fromValue(value: bigint, decimals?: number, format?: string | number): BigDecimal {
    return new BigDecimal(value, format, decimals);
  }

  public static isBigDecimal(value: string | BigDecimal): boolean {
    try {
      if (value instanceof BigDecimal) return true;
      BigDecimal.fromString(value);
      return true;
    } catch (err) {
      return false;
    }
  }
}
