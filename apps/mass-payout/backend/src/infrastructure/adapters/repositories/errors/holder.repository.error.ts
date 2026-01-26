// SPDX-License-Identifier: Apache-2.0

import { CustomError } from "@domain/errors/shared/custom.error"
import { Holder, HolderStatus } from "@domain/model/holder"

export class HolderRepositoryError extends CustomError {
  static readonly ERRORS = {
    SAVE_HOLDER: (holder: Holder) => `Error saving holder: ${JSON.stringify(holder)}.`,
    SAVE_HOLDERS: (holders: Holder[]) => `Error saving holders: ${JSON.stringify(holders)}.`,
    UPDATE_HOLDER: (holder: Holder) => `Error updating holder: ${JSON.stringify(holder)}.`,
    GET_HOLDERS_BY_BATCH_PAYOUT: (batchPayoutId: string) =>
      `Error getting holders for batch payout with id: ${batchPayoutId}.`,
    GET_HOLDERS_BY_DISTRIBUTION: (distributionId: string) =>
      `Error getting holders for distribution with id: ${distributionId}.`,
    GET_HOLDER_COUNT_BY_DISTRIBUTION: (distributionId: string) =>
      `Error getting holder count for distribution with id: ${distributionId}.`,
    GET_HOLDERS_BY_DISTRIBUTION_AND_STATUS: (distributionId: string, status: HolderStatus) =>
      `Error getting holders for distribution with id: ${distributionId} and status: ${status}.`,
  }

  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message)
    this.name = HolderRepositoryError.name
  }
}
