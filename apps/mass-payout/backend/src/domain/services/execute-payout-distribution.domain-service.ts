// SPDX-License-Identifier: Apache-2.0

import { BatchPayout } from "@domain/model/batch-payout"
import { AmountType, Distribution, PayoutSubtype, PayoutDetails } from "@domain/model/distribution"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { OnChainDistributionRepositoryPort } from "@domain/ports/on-chain-distribution-repository.port"
import { BasePayoutDomainService } from "@domain/services/base-payout.domain-service"
import { CreateHoldersDomainService } from "@domain/services/create-holders.domain-service"
import { UpdateBatchPayoutStatusDomainService } from "@domain/services/update-batch-payout-status.domain-service"
import { UpdateDistributionStatusDomainService } from "@domain/services/update-distribution-status.domain-service"
import { ValidateAssetPauseStateDomainService } from "@domain/services/validate-asset-pause-state.domain-service"
import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ExecuteDistributionResponse } from "@domain/ports/execute-distribution-response.interface"
import { HederaService } from "@domain/ports/hedera.port"

@Injectable()
export class ExecutePayoutDistributionDomainService extends BasePayoutDomainService {
  constructor(
    @Inject("AssetTokenizationStudioService")
    private readonly assetTokenizationStudioService: AssetTokenizationStudioService,
    @Inject("OnChainDistributionRepositoryPort")
    private readonly onChainDistributionRepository: OnChainDistributionRepositoryPort,
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
    @Inject(CreateHoldersDomainService)
    readonly createHoldersDomainService: CreateHoldersDomainService,
    @Inject("UpdateBatchPayoutStatusDomainService")
    readonly updateBatchPayoutStatusDomainService: UpdateBatchPayoutStatusDomainService,
    @Inject("UpdateDistributionStatusDomainService")
    private readonly updateDistributionStatusDomainService: UpdateDistributionStatusDomainService,
    @Inject("BatchPayoutRepository")
    readonly batchPayoutRepository: BatchPayoutRepository,
    readonly configService: ConfigService,
    @Inject("HederaService")
    readonly hederaService: HederaService,
    @Inject("OnChainLifeCycleCashFlowService")
    private readonly onChainLifeCycleCashFlowService: LifeCycleCashFlowPort,
    readonly validateAssetPauseStateDomainService: ValidateAssetPauseStateDomainService,
  ) {
    super(
      createHoldersDomainService,
      updateBatchPayoutStatusDomainService,
      batchPayoutRepository,
      hederaService,
      configService,
    )
  }

  override async execute(distribution: Distribution): Promise<void> {
    distribution.verifyIsPayout()
    await this.validateAssetPauseStateDomainService.validateDomainPauseState(distribution.asset, distribution.id)

    const distributionWithInProgressStatus =
      this.updateDistributionStatusDomainService.setDistributionStatusToInProgress(distribution)
    await this.distributionRepository.updateDistribution(distributionWithInProgressStatus)

    await this.createSnapshot(distributionWithInProgressStatus)
    if ((distribution.details as any).subtype === PayoutSubtype.RECURRING) {
      await this.createNextRecurringDistribution(distributionWithInProgressStatus)
    }
    const batchPayouts = await this.createBatchPayouts(distributionWithInProgressStatus)
    await this.processBatchPayouts(batchPayouts)
  }

  protected override async getHoldersCount(distribution: Distribution): Promise<number> {
    distribution.verifyIsPayout()

    const payoutDetails = distribution.details as PayoutDetails
    if (!payoutDetails.snapshotId) {
      throw new Error(`SnapshotId is missing for distribution ${distribution.id}`)
    }

    const holdersCount = await this.onChainDistributionRepository.getHoldersCountForSnapshotId(distribution)

    if (holdersCount <= 0) {
      throw new Error(`No holders found for distribution ${distribution.id}`)
    }

    return holdersCount
  }

  protected override async executeHederaCall(
    batch: BatchPayout,
    pageIndex: number,
  ): Promise<ExecuteDistributionResponse> {
    const distribution = batch.distribution
    const asset = distribution.asset

    distribution.verifyIsPayout()

    const payoutDetails = distribution.details as PayoutDetails
    if (!payoutDetails.snapshotId) {
      throw new Error(`SnapshotId is missing for distribution ${distribution.id}`)
    }

    const snapshotId = payoutDetails.snapshotId.value

    if (payoutDetails.amountType == AmountType.FIXED) {
      return this.onChainLifeCycleCashFlowService.executeAmountSnapshot(
        asset.lifeCycleCashFlowHederaAddress,
        asset.hederaTokenAddress,
        Number(snapshotId),
        pageIndex,
        batch.holdersNumber,
        payoutDetails.amount,
      )
    } else {
      return this.onChainLifeCycleCashFlowService.executePercentageSnapshot(
        asset.lifeCycleCashFlowHederaAddress,
        asset.hederaTokenAddress,
        Number(snapshotId),
        pageIndex,
        batch.holdersNumber,
        payoutDetails.amount,
      )
    }
  }

  private async createSnapshot(distribution: Distribution): Promise<void> {
    const snapshot = await this.assetTokenizationStudioService.takeSnapshot(distribution.asset.hederaTokenAddress)
    distribution.updateSnapshotId(snapshot)
    await this.distributionRepository.updateDistribution(distribution)
  }

  private async createNextRecurringDistribution(distribution: Distribution): Promise<void> {
    await this.distributionRepository.saveDistribution(distribution.createNextRecurring())
  }
}
