// SPDX-License-Identifier: Apache-2.0

import { Distribution, DistributionStatus } from "@domain/model/distribution"
import { Page, PageOptions } from "@domain/model/page"

export interface DistributionRepository {
  saveDistribution(distribution: Distribution): Promise<Distribution>

  getDistribution(id: string): Promise<Distribution | null>

  getAllDistributionsByAssetId(assetId: string): Promise<Distribution[]>

  getDistributionsByAssetId(assetId: string, pageOptions: PageOptions): Promise<Page<Distribution>>

  findByCorporateActionId(assetId: string, corporateActionId: string): Promise<Distribution | null>

  findByExecutionDateRange(startDate: Date, endDate: Date, status?: DistributionStatus): Promise<Distribution[]>

  updateDistribution(distribution: Distribution): Promise<Distribution>

  getDistributions(pageOptions: PageOptions): Promise<Page<Distribution>>

  getScheduledAutomatedDistributionsByEvmAddress(evmAddress: string): Promise<Distribution[]>
}
