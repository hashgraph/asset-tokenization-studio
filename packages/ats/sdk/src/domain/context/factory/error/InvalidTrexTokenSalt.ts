// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidTrexTokenSalt extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidValue, `TREX Token Salt ${value} is not valid`);
  }
}
