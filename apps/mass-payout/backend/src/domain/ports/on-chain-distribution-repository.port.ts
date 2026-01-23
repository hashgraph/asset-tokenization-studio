// SPDX-License-Identifier: Apache-2.0

import { Distribution } from "@domain/model/distribution"
import { Asset } from "@domain/model/asset"

export interface OnChainDistributionData {
  corporateActionID: string
  assetId: string
  executionDate: Date
  // Other relevant fields that may come from the ATS
}

export interface OnChainDistributionRepositoryPort {
  /**
   * Gets all distributions for a specific asset from the ATS.
   * The service layer will be responsible for filtering new ones
   */
  getAllDistributionsByAsset(asset: Asset): Promise<Distribution[]>

  /**
   * Gets the count of holders for a specific corporate action distribution from the ATS.
   * @param distribution the distribution containing all necessary information
   */
  getHoldersCountForCorporateActionId(distribution: Distribution): Promise<number>

  /**
   * Gets the count of holders for a specific payout distribution from the ATS.
   * @param distribution the distribution containing all necessary information
   */
  getHoldersCountForSnapshotId(distribution: Distribution): Promise<number>
}
