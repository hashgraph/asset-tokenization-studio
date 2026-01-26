// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidInterestRateType extends BaseError {
  constructor(value: number) {
    super(ErrorCode.InvalidInterestRateType, `Interest Rate Type ${value} is not valid`);
  }
}
