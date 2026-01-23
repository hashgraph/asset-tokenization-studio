// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class ZeroAddressNotAllowed extends BaseError {
  constructor() {
    super(ErrorCode.ZeroAddressNotAllowed, "Zero address is not allowed");
  }
}
