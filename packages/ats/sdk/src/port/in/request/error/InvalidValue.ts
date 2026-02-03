// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidValue extends BaseError {
  constructor(msg: string) {
    super(ErrorCode.InvalidValue, msg);
  }
}
