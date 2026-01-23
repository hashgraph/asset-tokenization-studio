// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export default class InvalidAmount extends BaseError {
  constructor(val: number | string, expected: number | string) {
    super(ErrorCode.InvalidAmount, `Invalid Amount ${val}, expected ${expected} decimals`);
  }
}
