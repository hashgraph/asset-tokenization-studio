// SPDX-License-Identifier: Apache-2.0

import { InvalidDataError } from "@domain/errors/shared/invalid-data.error"

export class HolderBatchPayoutIdMissingError extends InvalidDataError {
  constructor() {
    super("batchPayoutId is required")
  }
}

export class HolderHederaAddressInvalidError extends InvalidDataError {
  constructor() {
    super("holderHederaAddress must be in the format 0.0.X")
  }
}

export class HolderEvmAddressInvalidError extends InvalidDataError {
  constructor() {
    super("holderEvmAddress must be a valid Ethereum address")
  }
}

export class HolderRetryCounterNegativeError extends InvalidDataError {
  constructor() {
    super("retryCounter cannot be negative and is required")
  }
}
