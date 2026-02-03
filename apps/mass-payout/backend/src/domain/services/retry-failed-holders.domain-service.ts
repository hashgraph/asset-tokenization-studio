// SPDX-License-Identifier: Apache-2.0

import { Inject, Injectable } from "@nestjs/common"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { Holder, HolderStatus } from "@domain/model/holder"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { DistributionNotFoundError } from "@domain/errors/distribution.error"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { AmountType, Distribution, DistributionStatus, DistributionType } from "@domain/model/distribution"
import { ExecuteDistributionResponse } from "@domain/ports/execute-distribution-response.interface"
import { UpdateBatchPayoutStatusDomainService } from "@domain/services/update-batch-payout-status.domain-service"

@Injectable()
export class RetryFailedHoldersDomainService {
  constructor(
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
    @Inject("HolderRepository")
    private readonly holderRepository: HolderRepository,
    @Inject("OnChainLifeCycleCashFlowService")
    private readonly onChainLifeCycleCashFlowService: LifeCycleCashFlowPort,
    @Inject("UpdateBatchPayoutStatusDomainService")
    private readonly updateBatchPayoutStatusDomainService: UpdateBatchPayoutStatusDomainService,
  ) {}

  async execute(distributionId: string): Promise<void> {
    const distribution = await this.distributionRepository.getDistribution(distributionId)
    if (!distribution) {
      throw new DistributionNotFoundError(distributionId)
    }
    distribution.verifyStatus(DistributionStatus.FAILED)

    const failedHolders = await this.holderRepository.getHoldersByDistributionIdAndStatus(
      distributionId,
      HolderStatus.FAILED,
    )
    // Group holders by BatchPayout
    const groupedByBatchPayout = failedHolders.reduce((group, holder) => {
      const batchPayoutId = holder.batchPayout.id
      const currentGroup = group[batchPayoutId] ?? []
      return { ...group, [batchPayoutId]: [...currentGroup, holder] }
    }, {})

    const batchPayoutIds = Object.keys(groupedByBatchPayout)
    for (const batchPayoutId of batchPayoutIds) {
      // Get BatchPayout from first holder as all holders form the same group are related to the same BatchPayout
      const batchPayout = groupedByBatchPayout[batchPayoutId][0].batchPayout
      const batchPayoutFailedHolders = groupedByBatchPayout[batchPayoutId]
      await this.updateHoldersStatusToRetrying(batchPayoutFailedHolders)
      const executeDistributionResponse = await this.executeDistribution(batchPayoutFailedHolders, distribution)
      await this.updateHoldersAfterExecution(executeDistributionResponse, batchPayoutFailedHolders)
      await this.updateBatchPayoutStatusDomainService.execute(batchPayout)
    }
  }

  private async updateHoldersStatusToRetrying(holders: Holder[]): Promise<void> {
    holders.forEach((holder) => holder.retrying())
    await this.holderRepository.saveHolders(holders)
  }

  private async executeDistribution(
    holders: Holder[],
    distribution: Distribution,
  ): Promise<ExecuteDistributionResponse> {
    const holderAddresses = holders.map((failedHolder) => failedHolder.holderEvmAddress)
    let response: ExecuteDistributionResponse
    if (distribution.details.type === DistributionType.CORPORATE_ACTION) {
      response = await this.onChainLifeCycleCashFlowService.executeDistributionByAddresses(
        distribution.asset.lifeCycleCashFlowHederaAddress,
        distribution.asset.hederaTokenAddress,
        Number(distribution.details.corporateActionId.value),
        holderAddresses,
      )
    } else if (distribution.details.amountType === AmountType.FIXED) {
      response = await this.onChainLifeCycleCashFlowService.executeAmountSnapshotByAddresses(
        distribution.asset.lifeCycleCashFlowHederaAddress,
        distribution.asset.hederaTokenAddress,
        Number(distribution.details.snapshotId.value),
        holderAddresses,
        distribution.details.amount,
      )
    } else {
      response = await this.onChainLifeCycleCashFlowService.executePercentageSnapshotByAddresses(
        distribution.asset.lifeCycleCashFlowHederaAddress,
        distribution.asset.hederaTokenAddress,
        Number(distribution.details.snapshotId.value),
        holderAddresses,
        distribution.details.amount,
      )
    }
    return response
  }

  private async updateHoldersAfterExecution(
    executeDistributionResponse: ExecuteDistributionResponse,
    holders: Holder[],
  ): Promise<void> {
    holders.forEach((holder) => {
      const succeededIndex = executeDistributionResponse.succeeded.findIndex(
        (holderAddress) => holderAddress.toLowerCase() === holder.holderEvmAddress.toLowerCase(),
      )
      if (succeededIndex !== -1) {
        holder.succeed(executeDistributionResponse.paidAmount[succeededIndex])
      } else {
        holder.failed()
      }
    })
    await this.holderRepository.saveHolders(holders)
  }
}
