// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class BalanceNotFound extends BaseError {
  constructor() {
    super(ErrorCode.BalanceNotFound, `Response does not contain a balances result`);
  }
}
