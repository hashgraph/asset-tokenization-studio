// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AddressNotVerified extends BaseError {
  constructor() {
    super(ErrorCode.AddressNotVerified, "Address not verified");
  }
}
