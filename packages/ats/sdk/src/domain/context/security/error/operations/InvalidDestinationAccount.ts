// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidDestinationAccount extends BaseError {
  constructor() {
    super(ErrorCode.InvalidDestinationAccount, `Invalid null destination account`);
  }
}
