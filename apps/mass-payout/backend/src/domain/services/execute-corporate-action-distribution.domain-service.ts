// SPDX-License-Identifier: Apache-2.0

import { BatchPayout } from "@domain/model/batch-payout"
import { Distribution } from "@domain/model/distribution"
import { Inject, Injectable } from "@nestjs/common"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { BasePayoutDomainService } from "@domain/services/base-payout.domain-service"
import { CreateHoldersDomainService } from "@domain/services/create-holders.domain-service"
import { UpdateBatchPayoutStatusDomainService } from "@domain/services/update-batch-payout-status.domain-service"
import { ValidateAssetPauseStateDomainService } from "@domain/services/validate-asset-pause-state.domain-service"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { ConfigService } from "@nestjs/config"
import { OnChainDistributionRepositoryPort } from "@domain/ports/on-chain-distribution-repository.port"
import { HederaService } from "@domain/ports/hedera.port"
import { ExecuteDistributionResponse } from "@domain/ports/execute-distribution-response.interface"

@Injectable()
export class ExecuteCorporateActionDistributionDomainService extends BasePayoutDomainService {
  constructor(
    @Inject("OnChainDistributionRepositoryPort")
    private readonly onChainDistributionRepository: OnChainDistributionRepositoryPort,
    @Inject(CreateHoldersDomainService)
    readonly createHoldersDomainService: CreateHoldersDomainService,
    @Inject("UpdateBatchPayoutStatusDomainService")
    readonly updateBatchPayoutStatusDomainService: UpdateBatchPayoutStatusDomainService,
    @Inject("BatchPayoutRepository")
    readonly batchPayoutRepository: BatchPayoutRepository,
    readonly configService: ConfigService,
    @Inject("HederaService")
    readonly hederaService: HederaService,
    @Inject("OnChainLifeCycleCashFlowService")
    private readonly onChainLifeCycleCashFlowService: LifeCycleCashFlowPort,
    private readonly validateAssetPauseStateDomainService: ValidateAssetPauseStateDomainService,
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
    distribution.verifyIsCorporateAction()
    await this.validateAssetPauseStateDomainService.validateDomainPauseState(distribution.asset, distribution.id)
    const now = new Date()
    const executionDate = (distribution.details as any).executionDate

    const todayNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const executionDateNormalized = new Date(
      executionDate.getFullYear(),
      executionDate.getMonth(),
      executionDate.getDate(),
    )

    if (todayNormalized < executionDateNormalized) {
      return
    }
    const batchPayouts = await this.createBatchPayouts(distribution)
    await this.processBatchPayouts(batchPayouts)
  }

  protected override async getHoldersCount(distribution: Distribution): Promise<number> {
    distribution.verifyIsCorporateAction()
    const holdersCount = await this.onChainDistributionRepository.getHoldersCountForCorporateActionId(distribution)
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
    distribution.verifyIsCorporateAction()
    const asset = distribution.asset
    const corporateActionId = (distribution.details as any).corporateActionId.value
    return this.onChainLifeCycleCashFlowService.executeDistribution(
      asset.lifeCycleCashFlowHederaAddress,
      asset.hederaTokenAddress,
      Number(corporateActionId),
      pageIndex,
      batch.holdersNumber,
    )
  }
}
