// SPDX-License-Identifier: Apache-2.0

import { BatchPayout, BatchPayoutStatus } from "@domain/model/batch-payout"
import { Distribution } from "@domain/model/distribution"
import { UpdateBatchPayoutStatusDomainService } from "./update-batch-payout-status.domain-service"
import { CreateHoldersDomainService } from "./create-holders.domain-service"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { HederaService } from "@domain/ports/hedera.port"
import { Inject } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ExecuteDistributionResponse } from "@domain/ports/execute-distribution-response.interface"

export abstract class BasePayoutDomainService {
  protected constructor(
    @Inject(CreateHoldersDomainService)
    protected readonly createHoldersDomainService: CreateHoldersDomainService,
    @Inject("UpdateBatchPayoutStatusDomainService")
    protected readonly updateBatchPayoutStatusDomainService: UpdateBatchPayoutStatusDomainService,
    @Inject("BatchPayoutRepository")
    protected readonly batchPayoutRepository: BatchPayoutRepository,
    @Inject("HederaService")
    protected readonly hederaService: HederaService,
    protected readonly configService: ConfigService,
  ) {}

  async execute(distribution: Distribution) {
    const batchPayouts = await this.createBatchPayouts(distribution)
    await this.processBatchPayouts(batchPayouts)
  }

  protected abstract getHoldersCount(distribution: Distribution): Promise<number>

  protected abstract executeHederaCall(batch: BatchPayout, pageIndex: number): Promise<ExecuteDistributionResponse>

  protected async createBatchPayouts(distribution: Distribution): Promise<BatchPayout[]> {
    const batchSize = this.configService.get<number>("BATCH_SIZE") || 100
    const existingBatchPayouts = await this.batchPayoutRepository.getBatchPayoutsByDistribution(distribution)
    if (existingBatchPayouts.length > 0) {
      throw new Error(`BatchPayouts already exist for distribution ${distribution.id}`)
    }
    const holdersCount = await this.getHoldersCount(distribution)
    const numberOfBatches = Math.ceil(holdersCount / batchSize)

    const batchPayouts: BatchPayout[] = []

    for (let i = 0; i < numberOfBatches; i++) {
      const currentBatchSize = Math.min(batchSize, holdersCount - i * batchSize)

      const batchPayout = BatchPayout.create(
        distribution,
        `Batch ${i + 1}`,
        "0.0.0@0000000000.000000000",
        "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        currentBatchSize,
        BatchPayoutStatus.IN_PROGRESS,
      )

      await this.batchPayoutRepository.saveBatchPayout(batchPayout)
      batchPayouts.push(batchPayout)
    }

    return batchPayouts
  }

  protected async processBatchPayouts(batchPayouts: BatchPayout[]): Promise<void> {
    for (const [pageIndex, batchPayout] of batchPayouts.entries()) {
      await this.processSingleBatchPayout(batchPayout, pageIndex)
    }
  }

  protected async processSingleBatchPayout(batchPayout: BatchPayout, pageIndex: number): Promise<void> {
    const result = await this.executeHederaCall(batchPayout, pageIndex)
    const updatedBatchPayout = await this.handlePayoutResult(batchPayout, result)
    await this.updateBatchPayoutStatusDomainService.execute(updatedBatchPayout)
  }

  protected async handlePayoutResult(
    batchPayout: BatchPayout,
    result: ExecuteDistributionResponse,
  ): Promise<BatchPayout> {
    try {
      await this.createHoldersDomainService.execute(batchPayout, result.failed, result.succeeded, result.paidAmount)

      if (result.transactionId) {
        return await this.updateBatchPayoutTransactionHashes(batchPayout, result.transactionId)
      }

      return batchPayout
    } catch (error) {
      console.error("[BasePayoutDomainService] ERROR in handlePayoutResult:", error)
      throw error
    }
  }

  /**
   * Updates the transaction addresses in BatchPayout after successful DLT execution
   * @param batchPayout The batch payout to update
   * @param transactionId The transaction ID from the DLT response
   */
  private async updateBatchPayoutTransactionHashes(
    batchPayout: BatchPayout,
    transactionId: string,
  ): Promise<BatchPayout> {
    try {
      const hederaTransactionId = transactionId

      const hashResponse = await this.hederaService.getParentHederaTransactionHash(transactionId)
      const hederaTransactionHash = hashResponse.hederaTransactionHash

      const updatedBatchPayout = BatchPayout.createExisting(
        batchPayout.id,
        batchPayout.distribution,
        batchPayout.name,
        hederaTransactionId,
        hederaTransactionHash,
        batchPayout.holdersNumber,
        batchPayout.status,
        batchPayout.createdAt,
        batchPayout.updatedAt,
      )

      await this.batchPayoutRepository.updateBatchPayout(updatedBatchPayout)
      return updatedBatchPayout
    } catch (error) {
      console.error(`Failed to update transaction hashes for BatchPayout ${batchPayout.id}:`, error)
      return batchPayout
    }
  }
}
