// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountInBlackList extends BaseError {
  constructor(account: string) {
    super(ErrorCode.AccountInBlackList, `The account ${account} is in black list`);
  }
}
