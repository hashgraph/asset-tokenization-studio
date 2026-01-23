// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class NotIssuable extends BaseError {
  constructor() {
    super(ErrorCode.NotIssuable, `Security not issuable`);
  }
}
