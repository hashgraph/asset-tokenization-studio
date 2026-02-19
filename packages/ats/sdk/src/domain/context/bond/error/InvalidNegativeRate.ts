// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidNegativeRate extends BaseError {
  constructor(value: number) {
    super(ErrorCode.InvalidNegativeRate, `Negative rate ${value} is not valid`);
  }
}
