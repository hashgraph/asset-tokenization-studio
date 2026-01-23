// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountIsNotProceedRecipient extends BaseError {
  constructor(securityId: string, targetId: string) {
    super(
      ErrorCode.AccountIsNotProceedRecipient,
      `The account ${targetId} is not a proceed recipient of security ${securityId}`,
    );
  }
}
