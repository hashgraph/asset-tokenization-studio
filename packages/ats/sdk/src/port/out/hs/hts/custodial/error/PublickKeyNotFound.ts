// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from '@core/error/BaseError';

export class PublickKeyNotFound extends BaseError {
  constructor() {
    super(
      ErrorCode.PublickKeyNotFound,
      `PublicKey not found in the mirror node`,
    );
  }
}
