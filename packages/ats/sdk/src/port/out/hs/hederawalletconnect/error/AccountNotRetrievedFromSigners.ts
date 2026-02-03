// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountNotRetrievedFromSigners extends BaseError {
  constructor() {
    super(ErrorCode.AccountNotRetrievedFromSigners, `❌ No account ID retrieved from signers`);
  }
}
