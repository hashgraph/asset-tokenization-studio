// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from '@core/error/BaseError';

export class NotInitialized extends BaseError {
  constructor() {
    super(ErrorCode.NotInitialized, `❌ Hedera WalletConnect not initialized`);
  }
}
