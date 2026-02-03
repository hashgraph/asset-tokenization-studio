// SPDX-License-Identifier: Apache-2.0

import { Inject, Injectable, Logger } from "@nestjs/common"
import { Asset } from "@domain/model/asset"
import { Distribution, CorporateActionDetails } from "@domain/model/distribution"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import {
  OnChainDistributionData,
  OnChainDistributionRepositoryPort,
} from "@domain/ports/on-chain-distribution-repository.port"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"

@Injectable()
export class SyncFromOnChainDomainService {
  private readonly logger = new Logger(SyncFromOnChainDomainService.name)

  constructor(
    @Inject("AssetRepository")
    private readonly assetRepository: AssetRepository,
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
    @Inject("OnChainDistributionRepositoryPort")
    private readonly onChainDistributionRepository: OnChainDistributionRepositoryPort,
    @Inject("LifeCycleCashFlowPort")
    private readonly lifeCycleCashFlowPort: LifeCycleCashFlowPort,
  ) {}

  public async execute(): Promise<void> {
    this.logger.log("Starting distribution synchronization process")
    const assets = await this.assetRepository.getAllSyncEnabledAssets()
    this.logger.log(`Found ${assets.length} assets to sync distributions for`)

    for (const asset of assets) {
      this.logger.log(`Syncing distributions for asset: ${asset.name} (${asset.hederaTokenAddress})`)

      if (asset.lifeCycleCashFlowHederaAddress) {
        const isPaused = await this.lifeCycleCashFlowPort.isPaused(asset.lifeCycleCashFlowHederaAddress)
        if (isPaused) {
          this.logger.warn(`Contract for asset ${asset.name} is paused, skipping synchronization`)
          continue
        }
      }

      await this.syncDistributionsForAsset(asset)
    }

    this.logger.log("Distribution synchronization process completed")
  }

  private async syncDistributionsForAsset(asset: Asset): Promise<void> {
    this.logger.log(`Fetching on-chain distributions for asset ${asset.hederaTokenAddress}`)
    const remoteDistributions = await this.onChainDistributionRepository.getAllDistributionsByAsset(asset)

    this.logger.log(`Found ${remoteDistributions.length} on-chain distributions for asset ${asset.hederaTokenAddress}`)
    if (remoteDistributions.length === 0) {
      this.logger.log(`No distributions found for asset ${asset.hederaTokenAddress}, skipping sync`)
      return
    }

    let newDistributions = 0
    let updatedDistributions = 0
    let skippedDistributions = 0

    await Promise.all(
      remoteDistributions.map(async (remote) => {
        const corporateActionId = (remote.details as CorporateActionDetails).corporateActionId.value
        const existing = await this.distributionRepository.findByCorporateActionId(asset.id, corporateActionId)

        if (!existing) {
          this.logger.log(`Creating new distribution for corporate action ${corporateActionId}`)
          await this.distributionRepository.saveDistribution(remote)
          newDistributions++
        } else if (this.executionDateChanged(existing, remote)) {
          this.logger.log(`Updating execution date for corporate action ${corporateActionId}`)
          const executionDate = (remote.details as CorporateActionDetails).executionDate
          await this.updateExecutionDate(existing, executionDate)
          updatedDistributions++
        } else {
          this.logger.log(`Distribution for corporate action ${corporateActionId} is up to date, skipping`)
          skippedDistributions++
        }
      }),
    )

    this.logger.log(`Sync completed for asset ${asset.hederaTokenAddress}: ${newDistributions} new, 
      ${updatedDistributions} updated, ${skippedDistributions} skipped`)
  }

  private executionDateChanged(local: Distribution, remote: Distribution): boolean {
    const localDate = (local.details as CorporateActionDetails).executionDate
    const remoteDate = (remote.details as CorporateActionDetails).executionDate
    return localDate.valueOf() !== remoteDate.valueOf()
  }

  private async createDistribution(remote: OnChainDistributionData): Promise<void> {
    const asset = await this.assetRepository.getAsset(remote.assetId)
    const corporateActionId = CorporateActionId.create(remote.corporateActionID)
    const distribution = Distribution.createCorporateAction(asset, corporateActionId, remote.executionDate)
    await this.distributionRepository.saveDistribution(distribution)
  }

  private async updateExecutionDate(distribution: Distribution, executionDate: Date): Promise<void> {
    const updatedDistribution = distribution.updateExecutionDate(executionDate)
    await this.distributionRepository.saveDistribution(updatedDistribution)
  }
}
