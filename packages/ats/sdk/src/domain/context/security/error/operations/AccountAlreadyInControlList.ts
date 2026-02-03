// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountAlreadyInControlList extends BaseError {
  constructor(account: string) {
    super(ErrorCode.AccountAlreadyInControlList, `The account ${account} is already in the control list`);
  }
}
