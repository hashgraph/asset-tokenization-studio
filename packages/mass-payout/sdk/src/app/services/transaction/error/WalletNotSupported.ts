// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class WalletNotSupported extends BaseError {
  constructor() {
    super(ErrorCode.WalletNotSupported, "Invalid wallet type");
  }
}
