// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class WalletRecovered extends BaseError {
  constructor() {
    super(ErrorCode.WalletRecovered, "Wallet has been recovered");
  }
}
