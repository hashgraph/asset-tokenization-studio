// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class MissingInterestRateType extends BaseError {
  constructor() {
    super(ErrorCode.EmptyValue, `Interest Rate type is missing`);
  }
}
