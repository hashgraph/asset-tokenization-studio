// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidVcDates extends BaseError {
  constructor() {
    super(ErrorCode.InvalidVcDates, `Invalid validFrom or validUntil`);
  }
}
