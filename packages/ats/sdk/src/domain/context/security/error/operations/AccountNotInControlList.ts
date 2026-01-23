// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountNotInControlList extends BaseError {
  constructor(account: string) {
    super(ErrorCode.AccountNotInControlList, `The account ${account} is not in the control list`);
  }
}
