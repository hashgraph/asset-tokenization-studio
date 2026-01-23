// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from '@core/error/BaseError';

export class NoSettings extends BaseError {
  constructor() {
    super(ErrorCode.NoSettings, `❌ Hedera WalletConnect settings not set`);
  }
}
