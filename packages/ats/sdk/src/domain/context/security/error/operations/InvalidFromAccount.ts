// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidFromAccount extends BaseError {
  constructor() {
    super(ErrorCode.InvalidFromAccount, `Invalid null from account`);
  }
}
