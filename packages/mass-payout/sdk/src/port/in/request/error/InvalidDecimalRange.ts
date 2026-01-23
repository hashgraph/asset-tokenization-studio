// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export default class InvalidDecimalRange extends BaseError {
  constructor(val: number | string, min: number, max?: number) {
    super(
      ErrorCode.InvalidRange,
      `Invalid Decimal Value ${val}, outside range ${max !== undefined ? `[${min}, ${max}]` : min}`,
    );
  }
}
