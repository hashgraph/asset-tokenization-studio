// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError"

export class TransactionResultNotFound extends BaseError {
  constructor() {
    super(
      ErrorCode.TransactionResultNotFound,
      "Response does not contain any transaction"
    )
  }
}
