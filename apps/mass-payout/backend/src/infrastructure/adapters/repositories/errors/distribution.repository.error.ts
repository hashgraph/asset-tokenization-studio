// SPDX-License-Identifier: Apache-2.0

import { CustomError } from "@domain/errors/shared/custom.error"
import { Distribution } from "@domain/model/distribution"

export class DistributionRepositoryError extends CustomError {
  static readonly ERRORS = {
    SAVE_DISTRIBUTION: (distribution: Distribution) => `Error saving distribution: ${JSON.stringify(distribution)}.`,
    GET_DISTRIBUTION: (id: string) => `Error getting distribution with id: ${id}.`,
    GET_DISTRIBUTIONS_BY_ASSET: (assetId: string) => `Error getting distributions for asset with id: ${assetId}.`,
    GET_DISTRIBUTION_BY_CORP_ACTION: (assetId: string, corporateActionId: string) =>
      `Error getting distribution for asset ${assetId} and corporate action id: ${corporateActionId}.`,
    GET_DISTRIBUTIONS_BY_EXECUTION_DATE: (startDate: Date, endDate: Date) =>
      `Error getting distributions by execution date range: ${startDate.toISOString()} to ${endDate.toISOString()}.`,
    UPDATE_DISTRIBUTION: (distribution: Distribution) =>
      `Error updating distribution: ${JSON.stringify(distribution)}.`,
    GET_DISTRIBUTIONS: () => "Error getting distributions.",
  }

  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message)
    this.name = DistributionRepositoryError.name
  }
}
