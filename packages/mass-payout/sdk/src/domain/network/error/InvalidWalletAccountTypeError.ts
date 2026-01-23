// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidWalletTypeError extends BaseError {
  constructor() {
    super(ErrorCode.OperationNotAllowed, "Wallet is not allowed.");
    Object.setPrototypeOf(this, InvalidWalletTypeError.prototype);
  }
}
