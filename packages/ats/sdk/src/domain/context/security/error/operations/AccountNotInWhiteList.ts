// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountNotInWhiteList extends BaseError {
  constructor(account: string) {
    super(ErrorCode.AccountNotInWhiteList, `The account ${account} is not in white list`);
  }
}
