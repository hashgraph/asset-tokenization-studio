// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InsufficientHoldBalance extends BaseError {
  constructor() {
    super(ErrorCode.InsufficientHoldBalance, `The hold balance is not sufficient to perform the operation`);
  }
}
