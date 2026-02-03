// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export default class InvalidTimestampRange extends BaseError {
  constructor(val: Date, min: Date, max?: Date) {
    super(
      ErrorCode.InvalidRange,
      `Invalid Timestamp ${val}, outside range ${max !== undefined ? `[${min}, ${max}]` : min}`,
    );
  }
}
