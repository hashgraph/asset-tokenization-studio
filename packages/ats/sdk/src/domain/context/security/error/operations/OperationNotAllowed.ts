// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class OperationNotAllowed extends BaseError {
  constructor(val: string) {
    super(ErrorCode.OperationNotAllowed, val);
  }
}
