// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountIsProceedRecipient extends BaseError {
  constructor(securityId: string, targetId: string) {
    super(
      ErrorCode.AccountIsProceedRecipient,
      `The account ${targetId} is proceed recipient of security ${securityId}`,
    );
  }
}
