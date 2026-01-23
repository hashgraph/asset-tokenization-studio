// SPDX-License-Identifier: Apache-2.0

import { HederaId } from "@domain/shared/HederaId";

export default class CheckStrings {
  public static isNotEmpty(value?: string): boolean {
    if (!value) return false;
    if (value.length == 0) return false;
    return true;
  }

  public static isLengthUnder(value: string, maxLength: number): boolean {
    if (value.length > maxLength) return false;
    return true;
  }

  public static isLength(value: string, length: number): boolean {
    if (value.length != length) return false;
    return true;
  }

  public static isLengthBetween(value: string, min: number, max: number): boolean {
    if (value.length > max || value.length < min) return false;
    return true;
  }

  public static isAccountId(value: string): boolean {
    try {
      HederaId.from(value);
      return true;
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (err) {
      return false;
    }
  }
}
