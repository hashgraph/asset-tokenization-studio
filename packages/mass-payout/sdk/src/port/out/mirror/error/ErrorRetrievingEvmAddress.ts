// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError"

export class ErrorRetrievingEvmAddress extends BaseError {
  constructor(accountId: string, error: unknown) {
    super(
      ErrorCode.ErrorRetrievingEvmAddress,
      `EVM address could not be retrieved for ${accountId}, error: ${(error as Error).message}`
    )
  }
}
