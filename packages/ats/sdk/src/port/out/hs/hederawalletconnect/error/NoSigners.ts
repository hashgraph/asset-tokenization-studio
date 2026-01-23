// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from '@core/error/BaseError';

export class NoSigners extends BaseError {
  constructor() {
    super(ErrorCode.NoSigners, `❌ No signers retrieved from wallet connect`);
  }
}
