// SPDX-License-Identifier: Apache-2.0

import { BatchPayout, BatchPayoutStatus } from "@domain/model/batch-payout"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { UpdateDistributionStatusDomainService } from "@domain/services/update-distribution-status.domain-service"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class TransitionBatchPayoutToPartiallyCompletedDomainService {
  constructor(
    @Inject("BatchPayoutRepository")
    private readonly batchPayoutRepository: BatchPayoutRepository,
    @Inject("UpdateDistributionStatusDomainService")
    private readonly updateDistributionStatusDomainService: UpdateDistributionStatusDomainService,
  ) {}

  async execute(batchPayout: BatchPayout): Promise<BatchPayout> {
    if (this.canTransitionToPartiallyCompleted(batchPayout)) {
      const updatedBatchPayout = this.setBatchPayoutStatusToPartiallyCompleted(batchPayout)
      const savedBatchPayout = await this.batchPayoutRepository.saveBatchPayout(updatedBatchPayout)
      await this.updateDistributionStatusDomainService.execute(savedBatchPayout.distribution)
      return savedBatchPayout
    }
    return batchPayout
  }

  private canTransitionToPartiallyCompleted(batchPayout: BatchPayout): boolean {
    return batchPayout.status !== BatchPayoutStatus.COMPLETED && batchPayout.status !== BatchPayoutStatus.FAILED
  }

  private setBatchPayoutStatusToPartiallyCompleted(batchPayout: BatchPayout): BatchPayout {
    return BatchPayout.createExisting(
      batchPayout.id,
      batchPayout.distribution,
      batchPayout.name,
      batchPayout.hederaTransactionId,
      batchPayout.hederaTransactionHash,
      batchPayout.holdersNumber,
      BatchPayoutStatus.PARTIALLY_COMPLETED,
      batchPayout.createdAt,
      batchPayout.updatedAt,
    )
  }
}
