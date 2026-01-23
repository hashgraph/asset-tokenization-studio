// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from '@core/error/BaseError';

export class TransactionNotFound extends BaseError {
  constructor() {
    super(
      ErrorCode.TransactionNotFound,
      `Response does not contain any transaction`,
    );
  }
}
