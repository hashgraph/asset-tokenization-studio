// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "./BaseError";

export class InvalidTimeUnits extends BaseError {
  constructor() {
    super(ErrorCode.InvalidTimeUnits, `Invalid time unit. Please use "seconds", "milliseconds", "sec", or "ms".`);
  }
}
