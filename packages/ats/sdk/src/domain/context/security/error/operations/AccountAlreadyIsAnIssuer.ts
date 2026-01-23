// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountIsAlreadyAnIssuer extends BaseError {
  constructor(account: string) {
    super(ErrorCode.AccountIsAlreadyAnIssuer, `The account ${account} is already an issuer`);
  }
}
