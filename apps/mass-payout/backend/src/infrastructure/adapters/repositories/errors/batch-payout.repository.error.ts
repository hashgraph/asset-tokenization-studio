// SPDX-License-Identifier: Apache-2.0

import { CustomError } from "@domain/errors/shared/custom.error"
import { BatchPayout } from "@domain/model/batch-payout"

export class BatchPayoutRepositoryError extends CustomError {
  static readonly ERRORS = {
    SAVE_BATCH_PAYOUT: (batchPayout: BatchPayout) => `Error saving batch payout: ${JSON.stringify(batchPayout)}.`,
    SAVE_BATCH_PAYOUTS: (batchPayouts: BatchPayout[]) => `Error saving batch payouts: ${JSON.stringify(batchPayouts)}.`,
    GET_BATCH_PAYOUT: (id: string) => `Error getting batch payout with id: ${id}.`,
    GET_BATCH_PAYOUTS_BY_DISTRIBUTION: (distributionId: string) =>
      `Error getting batch payouts for distribution with id: ${distributionId}.`,
    UPDATE_BATCH_PAYOUT: (batchPayout: BatchPayout) => `Error updating batch payout: ${JSON.stringify(batchPayout)}.`,
  }

  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message)
    this.name = BatchPayoutRepositoryError.name
  }
}
