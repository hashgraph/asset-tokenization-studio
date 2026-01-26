// SPDX-License-Identifier: Apache-2.0

import { Holder, HolderStatus } from "@domain/model/holder"
import { Page, PageOptions } from "@domain/model/page"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { HolderRepositoryError } from "@infrastructure/adapters/repositories/errors/holder.repository.error"
import { HolderPersistence } from "@infrastructure/adapters/repositories/model/holder.persistence"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

@Injectable()
export class HolderTypeOrmRepository implements HolderRepository {
  constructor(
    @InjectRepository(HolderPersistence)
    private readonly holderRepository: Repository<HolderPersistence>,
  ) {}

  async saveHolder(holder: Holder): Promise<Holder> {
    try {
      const persistence = HolderPersistence.fromHolder(holder)
      await this.holderRepository.save(persistence)
      return persistence.toHolder()
    } catch (error) {
      throw new HolderRepositoryError(HolderRepositoryError.ERRORS.SAVE_HOLDER(holder), error)
    }
  }

  async saveHolders(holders: Holder[]): Promise<Holder[]> {
    try {
      const persistences = holders.map((holder) => {
        const holderPersistence = HolderPersistence.fromHolder(holder)
        // TODO We do not need to set updateAt as it is done automatically due to @UpdateDateColumn,
        //  the problem is that the date is set in UTC, but we are setting createdAt as
        // new Date() in entities constructors, giving error when transforming from persistence to domain
        // model because updateAt is less than createdAt in that case. We should
        // avoid setting createdAt dates in constructors or store @UpdateDateColumn as dates with
        // proper timezone or set project timezone to UTC
        holderPersistence.updatedAt = new Date()
        return holderPersistence
      })
      await this.holderRepository.save(persistences)
      return persistences.map((persistence) => persistence.toHolder())
    } catch (error) {
      throw new HolderRepositoryError(HolderRepositoryError.ERRORS.SAVE_HOLDERS(holders), error)
    }
  }

  async updateHolder(holder: Holder): Promise<Holder> {
    try {
      const persistence = HolderPersistence.fromHolder(holder)
      await this.holderRepository.update(persistence.id, persistence)
      return persistence.toHolder()
    } catch (error) {
      throw new HolderRepositoryError(HolderRepositoryError.ERRORS.UPDATE_HOLDER(holder), error)
    }
  }

  async getHoldersByBatchPayout(batchPayoutId: string): Promise<Holder[]> {
    try {
      const holders = await this.holderRepository.find({
        relations: {
          batchPayout: {
            distribution: { asset: true },
          },
        },
        where: {
          batchPayout: {
            id: batchPayoutId,
          },
        },
      })
      return holders.map((holder) => holder.toHolder())
    } catch (error) {
      throw new HolderRepositoryError(HolderRepositoryError.ERRORS.GET_HOLDERS_BY_BATCH_PAYOUT(batchPayoutId), error)
    }
  }

  async getAllHoldersByDistributionId(distributionId: string): Promise<Holder[]> {
    try {
      const holders = await this.holderRepository.find({
        relations: {
          batchPayout: {
            distribution: { asset: true },
          },
        },
        where: {
          batchPayout: {
            distributionId,
          },
        },
      })

      return holders.map((holder) => holder.toHolder())
    } catch (error) {
      throw new HolderRepositoryError(HolderRepositoryError.ERRORS.GET_HOLDERS_BY_DISTRIBUTION(distributionId), error)
    }
  }

  async getHoldersByDistributionId(distributionId: string, pageOptions: PageOptions): Promise<Page<Holder>> {
    try {
      const skip = (pageOptions.page - 1) * pageOptions.limit
      const take = pageOptions.limit
      const order = {
        [pageOptions.order.orderBy]: pageOptions.order.order,
      }

      const [persistences, total] = await this.holderRepository.findAndCount({
        where: {
          batchPayout: {
            distributionId,
          },
        },
        relations: {
          batchPayout: {
            distribution: { asset: true },
          },
        },
        skip,
        take,
        order,
      })

      return {
        items: persistences.map((persistence) => persistence.toHolder()),
        total,
        page: pageOptions.page,
        limit: pageOptions.limit,
        totalPages: Math.ceil(total / pageOptions.limit),
      }
    } catch (error) {
      throw new HolderRepositoryError(HolderRepositoryError.ERRORS.GET_HOLDERS_BY_DISTRIBUTION(distributionId), error)
    }
  }

  async countHoldersByDistributionId(distributionId: string): Promise<number> {
    try {
      return await this.holderRepository.count({
        where: {
          batchPayout: {
            distributionId,
          },
        },
        relations: {
          batchPayout: {
            distribution: true,
          },
        },
      })
    } catch (error) {
      throw new HolderRepositoryError(
        HolderRepositoryError.ERRORS.GET_HOLDER_COUNT_BY_DISTRIBUTION(distributionId),
        error,
      )
    }
  }

  async getHoldersByDistributionIdAndStatus(distributionId: string, status: HolderStatus): Promise<Holder[]> {
    try {
      const holders = await this.holderRepository.find({
        relations: {
          batchPayout: {
            distribution: { asset: true },
          },
        },
        where: {
          batchPayout: {
            distributionId,
          },
          status,
        },
      })

      return holders.map((holder) => holder.toHolder())
    } catch (error) {
      throw new HolderRepositoryError(
        HolderRepositoryError.ERRORS.GET_HOLDERS_BY_DISTRIBUTION_AND_STATUS(distributionId, status),
        error,
      )
    }
  }
}
