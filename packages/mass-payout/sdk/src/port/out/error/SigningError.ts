// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError"

export class SigningError extends BaseError {
  constructor(val: unknown) {
    super(
      ErrorCode.SigningError,
      `An error ocurred when singing the transaction: ${val}`
    )
  }
}
