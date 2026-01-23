// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountIsNotOperator extends BaseError {
  constructor(operatorId: string, targetId: string) {
    super(ErrorCode.AccountIsNotOperator, `The account ${operatorId} is not an operator of account ${targetId}`);
  }
}
