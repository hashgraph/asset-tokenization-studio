// SPDX-License-Identifier: Apache-2.0

import { BatchPayout } from "@domain/model/batch-payout"
import { Distribution } from "@domain/model/distribution"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { BatchPayoutPersistence } from "@infrastructure/adapters/repositories/model/batch-payout.persistence"
import { BatchPayoutRepositoryError } from "@infrastructure/adapters/repositories/errors/batch-payout.repository.error"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

@Injectable()
export class BatchPayoutTypeOrmRepository implements BatchPayoutRepository {
  constructor(
    @InjectRepository(BatchPayoutPersistence)
    private readonly batchPayoutRepository: Repository<BatchPayoutPersistence>,
  ) {}

  async saveBatchPayout(item: BatchPayout): Promise<BatchPayout> {
    try {
      const batchPayoutPersistence = BatchPayoutPersistence.fromBatchPayout(item)
      batchPayoutPersistence.createdAt = undefined
      batchPayoutPersistence.updatedAt = undefined
      const result = await this.batchPayoutRepository.insert(batchPayoutPersistence)
      batchPayoutPersistence.createdAt = result.generatedMaps[0].createdAt
      batchPayoutPersistence.updatedAt = result.generatedMaps[0].updatedAt
      return batchPayoutPersistence.toBatchPayout()
    } catch (error) {
      throw new BatchPayoutRepositoryError(BatchPayoutRepositoryError.ERRORS.SAVE_BATCH_PAYOUT(item), error)
    }
  }

  async saveBatchPayouts(items: BatchPayout[]): Promise<BatchPayout[]> {
    try {
      const batchPayoutPersistenceList = items.map((item) => BatchPayoutPersistence.fromBatchPayout(item))
      await this.batchPayoutRepository.insert(batchPayoutPersistenceList)
      return batchPayoutPersistenceList.map((batchPayoutPersistence) => batchPayoutPersistence.toBatchPayout())
    } catch (error) {
      throw new BatchPayoutRepositoryError(BatchPayoutRepositoryError.ERRORS.SAVE_BATCH_PAYOUTS(items), error)
    }
  }

  async getBatchPayout(id: string): Promise<BatchPayout | undefined> {
    try {
      const batchPayoutPersistence = await this.batchPayoutRepository.findOne({
        where: { id },
        relations: ["distribution", "distribution.asset"],
      })
      return batchPayoutPersistence ? batchPayoutPersistence.toBatchPayout() : undefined
    } catch (error) {
      throw new BatchPayoutRepositoryError(BatchPayoutRepositoryError.ERRORS.GET_BATCH_PAYOUT(id), error)
    }
  }

  async getBatchPayoutsByDistribution(distribution: Distribution): Promise<BatchPayout[]> {
    try {
      const batchPayoutPersistenceList = await this.batchPayoutRepository.find({
        where: { distributionId: distribution.id },
        relations: ["distribution", "distribution.asset"],
      })
      return batchPayoutPersistenceList.map((batchPayoutPersistence) => batchPayoutPersistence.toBatchPayout())
    } catch (error) {
      throw new BatchPayoutRepositoryError(
        BatchPayoutRepositoryError.ERRORS.GET_BATCH_PAYOUTS_BY_DISTRIBUTION(distribution.id),
        error,
      )
    }
  }

  async updateBatchPayout(item: BatchPayout): Promise<BatchPayout> {
    try {
      let batchPayoutPersistence = BatchPayoutPersistence.fromBatchPayout(item)
      batchPayoutPersistence.updatedAt = new Date()
      batchPayoutPersistence = await this.batchPayoutRepository.save(batchPayoutPersistence)
      return batchPayoutPersistence.toBatchPayout()
    } catch (error) {
      throw new BatchPayoutRepositoryError(BatchPayoutRepositoryError.ERRORS.UPDATE_BATCH_PAYOUT(item), error)
    }
  }
}
