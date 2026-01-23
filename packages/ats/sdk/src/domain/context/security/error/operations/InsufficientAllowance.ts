// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InsufficientAllowance extends BaseError {
  constructor() {
    super(ErrorCode.InsufficientAllowance, `Insufficient allowance`);
  }
}
