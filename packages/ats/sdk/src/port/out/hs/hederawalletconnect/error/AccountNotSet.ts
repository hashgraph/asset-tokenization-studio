// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from '@core/error/BaseError';

export class AccountNotSet extends BaseError {
  constructor() {
    super(ErrorCode.AccountNotSet, `❌ Account not set`);
  }
}
