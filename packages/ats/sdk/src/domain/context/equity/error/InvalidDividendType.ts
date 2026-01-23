// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidDividendType extends BaseError {
  constructor(value: number) {
    super(ErrorCode.InvalidDividendType, `Dividend Type ${value} is not valid`);
  }
}
