// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidRequest extends BaseError {
  constructor(val: string) {
    super(ErrorCode.InvalidRequest, val);
  }
}
