// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidRateStatus extends BaseError {
  constructor(value: number) {
    super(ErrorCode.InvalidRateStatus, `Rate Status ${value} is not valid`);
  }
}
