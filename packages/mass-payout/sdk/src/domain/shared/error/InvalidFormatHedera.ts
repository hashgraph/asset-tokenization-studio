// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidFormatHedera extends BaseError {
  constructor(val: unknown) {
    super(ErrorCode.InvalidIdFormatHedera, `"${val}" does not have the correct format (0.0.X)`);
  }
}
