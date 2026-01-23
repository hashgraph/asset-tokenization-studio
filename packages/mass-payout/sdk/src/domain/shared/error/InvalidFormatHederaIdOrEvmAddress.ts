// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidFormatHederaIdOrEvmAddress extends BaseError {
  constructor(val: unknown) {
    super(
      ErrorCode.InvalidIdFormatHederaIdOrEvmAddress,
      `"${val}" does not have the correct format (0.0.X or 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)`,
    );
  }
}
