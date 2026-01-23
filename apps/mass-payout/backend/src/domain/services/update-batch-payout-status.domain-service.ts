// SPDX-License-Identifier: Apache-2.0

import { BatchPayout, BatchPayoutStatus } from "@domain/model/batch-payout"
import { HolderStatus } from "@domain/model/holder"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { Inject, Injectable } from "@nestjs/common"
import { UpdateDistributionStatusDomainService } from "@domain/services/update-distribution-status.domain-service"

@Injectable()
export class UpdateBatchPayoutStatusDomainService {
  constructor(
    @Inject("BatchPayoutRepository")
    private readonly batchPayoutRepository: BatchPayoutRepository,
    @Inject("HolderRepository")
    private readonly holderRepository: HolderRepository,
    @Inject("UpdateDistributionStatusDomainService")
    private readonly updateDistributionStatusDomainService: UpdateDistributionStatusDomainService,
  ) {}

  async execute(batchPayout: BatchPayout): Promise<BatchPayout> {
    batchPayout = await this.determineStatusFromHolders(batchPayout)
    batchPayout = await this.batchPayoutRepository.updateBatchPayout(batchPayout)
    await this.updateDistributionStatusDomainService.execute(batchPayout.distribution)
    return batchPayout
  }

  private async determineStatusFromHolders(batchPayout: BatchPayout): Promise<BatchPayout> {
    const holders = await this.holderRepository.getHoldersByBatchPayout(batchPayout.id)
    const hasAnyHolder = holders.some((holder) => holder.status === HolderStatus.FAILED)

    if (hasAnyHolder) {
      return this.setBatchPayoutStatusToFailed(batchPayout)
    }

    const areAllHoldersSuccessful = holders.every((holder) => holder.status === HolderStatus.SUCCESS)
    if (areAllHoldersSuccessful) {
      return this.setBatchPayoutStatusToCompleted(batchPayout)
    }
    return batchPayout
  }

  private setBatchPayoutStatusToFailed(batchPayout: BatchPayout): BatchPayout {
    return BatchPayout.createExisting(
      batchPayout.id,
      batchPayout.distribution,
      batchPayout.name,
      batchPayout.hederaTransactionId,
      batchPayout.hederaTransactionHash,
      batchPayout.holdersNumber,
      BatchPayoutStatus.FAILED,
      batchPayout.createdAt,
      batchPayout.updatedAt,
    )
  }

  private setBatchPayoutStatusToCompleted(batchPayout: BatchPayout): BatchPayout {
    return BatchPayout.createExisting(
      batchPayout.id,
      batchPayout.distribution,
      batchPayout.name,
      batchPayout.hederaTransactionId,
      batchPayout.hederaTransactionHash,
      batchPayout.holdersNumber,
      BatchPayoutStatus.COMPLETED,
      batchPayout.createdAt,
      batchPayout.updatedAt,
    )
  }
}
