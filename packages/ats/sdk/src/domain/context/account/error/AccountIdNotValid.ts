// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountIdNotValid extends BaseError {
  constructor(accountId: string) {
    super(ErrorCode.AccountIdInValid, `AccountId ${accountId} is not a valid ID`);
  }
}
