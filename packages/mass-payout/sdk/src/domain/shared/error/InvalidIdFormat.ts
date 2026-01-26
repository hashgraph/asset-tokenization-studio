// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidIdFormat extends BaseError {
  constructor(val: unknown) {
    super(ErrorCode.InvalidIdFormatHedera, `Value "${val}" does not have the correct format (0.0.0)`);
  }
}
