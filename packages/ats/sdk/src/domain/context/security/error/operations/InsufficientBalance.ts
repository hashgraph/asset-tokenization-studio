// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InsufficientBalance extends BaseError {
  constructor() {
    super(ErrorCode.InsufficientBalance, `The account's balance is not sufficient to perform the operation`);
  }
}
