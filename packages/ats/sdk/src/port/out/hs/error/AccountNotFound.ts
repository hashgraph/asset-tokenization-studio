// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountNotFound extends BaseError {
  constructor() {
    super(ErrorCode.AccountNotFound, `❌ No account info retrieved from Mirror Node.`);
  }
}
