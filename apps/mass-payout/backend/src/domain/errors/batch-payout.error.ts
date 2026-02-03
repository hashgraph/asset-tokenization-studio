// SPDX-License-Identifier: Apache-2.0

import { InvalidDataError } from "@domain/errors/shared/invalid-data.error"

export class BatchPayoutDistributionIdMissingError extends InvalidDataError {
  constructor() {
    super("distributionId is required")
  }
}

export class BatchPayoutHederaTransactionIdInvalidError extends InvalidDataError {
  constructor() {
    super("hederaTransactionId must have the format <shard>.<realm>.<account>@<seconds>.<nanos>")
  }
}

export class BatchPayoutHederaTransactionHashInvalidError extends InvalidDataError {
  constructor() {
    super("hederaTransactionHash must be a valid Hedera transaction hash (0x followed by 96 hex characters)")
  }
}

export class BatchPayoutHoldersNumberInvalidError extends InvalidDataError {
  constructor() {
    super("holdersNumber must be a positive integer")
  }
}
