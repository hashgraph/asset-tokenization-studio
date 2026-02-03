// SPDX-License-Identifier: Apache-2.0

import { Distribution, DistributionStatus, DistributionType, PayoutSubtype } from "@domain/model/distribution"
import { Page, PageOptions } from "@domain/model/page"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { DistributionRepositoryError } from "@infrastructure/adapters/repositories/errors/distribution.repository.error"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Between, FindOptionsOrder, Repository } from "typeorm"

@Injectable()
export class DistributionTypeOrmRepository implements DistributionRepository {
  constructor(
    @InjectRepository(DistributionPersistence)
    private readonly distributionRepository: Repository<DistributionPersistence>,
  ) {}

  async saveDistribution(distribution: Distribution): Promise<Distribution> {
    try {
      const distributionPersistence = DistributionPersistence.fromDistribution(distribution)
      const savedPersistence = await this.distributionRepository.save(distributionPersistence)
      return savedPersistence.toDistribution()
    } catch (error) {
      throw new DistributionRepositoryError(DistributionRepositoryError.ERRORS.SAVE_DISTRIBUTION(distribution), error)
    }
  }

  async getDistribution(id: string): Promise<Distribution | null> {
    try {
      const distributionPersistence = await this.distributionRepository.findOne({
        where: { id },
        relations: ["asset"],
      })
      return distributionPersistence ? distributionPersistence.toDistribution() : null
    } catch (error) {
      throw new DistributionRepositoryError(DistributionRepositoryError.ERRORS.GET_DISTRIBUTION(id), error)
    }
  }

  async getAllDistributionsByAssetId(assetId: string): Promise<Distribution[]> {
    try {
      const distributionPersistences = await this.distributionRepository.find({
        where: { assetId },
        relations: ["asset"],
      })
      return distributionPersistences.map((p) => p.toDistribution())
    } catch (error) {
      throw new DistributionRepositoryError(
        DistributionRepositoryError.ERRORS.GET_DISTRIBUTIONS_BY_ASSET(assetId),
        error,
      )
    }
  }

  async findByCorporateActionId(assetId: string, corporateActionId: string): Promise<Distribution | null> {
    try {
      const distributionPersistence = await this.distributionRepository.findOne({
        where: {
          corporateActionID: corporateActionId,
          assetId: assetId,
        },
        relations: ["asset"],
      })
      return distributionPersistence ? distributionPersistence.toDistribution() : null
    } catch (error) {
      throw new DistributionRepositoryError(
        DistributionRepositoryError.ERRORS.GET_DISTRIBUTION_BY_CORP_ACTION(assetId, corporateActionId),
        error,
      )
    }
  }

  async findByExecutionDateRange(startDate: Date, endDate: Date, status?: DistributionStatus): Promise<Distribution[]> {
    try {
      const where: any = { executionDate: Between(startDate, endDate), status }

      const persistences = await this.distributionRepository.find({
        where,
        relations: ["asset"],
      })
      return persistences.map((p) => p.toDistribution())
    } catch (error) {
      throw new DistributionRepositoryError(
        DistributionRepositoryError.ERRORS.GET_DISTRIBUTIONS_BY_EXECUTION_DATE(startDate, endDate),
        error,
      )
    }
  }

  async updateDistribution(distribution: Distribution): Promise<Distribution> {
    try {
      const distributionPersistence = DistributionPersistence.fromDistribution(distribution)
      distributionPersistence.updatedAt = new Date()
      const updatedPersistence = await this.distributionRepository.save(distributionPersistence)
      return updatedPersistence.toDistribution()
    } catch (error) {
      throw new DistributionRepositoryError(DistributionRepositoryError.ERRORS.UPDATE_DISTRIBUTION(distribution), error)
    }
  }

  async getDistributions(pageOptions: PageOptions): Promise<Page<Distribution>> {
    try {
      const skip = (pageOptions.page - 1) * pageOptions.limit
      const take = pageOptions.limit
      const order: FindOptionsOrder<DistributionPersistence> = {
        [pageOptions.order?.orderBy || "createdAt"]: pageOptions.order?.order || "DESC",
      }
      const [distributionPersistences, total] = await this.distributionRepository.findAndCount({
        skip,
        take,
        order,
        relations: ["asset"],
      })
      const distributions = distributionPersistences.map((p) => p.toDistribution())
      return {
        items: distributions,
        total,
        page: pageOptions.page,
        limit: pageOptions.limit,
        totalPages: Math.ceil(total / pageOptions.limit),
      }
    } catch (error) {
      throw new DistributionRepositoryError(DistributionRepositoryError.ERRORS.GET_DISTRIBUTIONS(), error)
    }
  }

  async getDistributionsByAssetId(assetId: string, pageOptions: PageOptions): Promise<Page<Distribution>> {
    try {
      const skip = (pageOptions.page - 1) * pageOptions.limit
      const take = pageOptions.limit
      const order = {
        [pageOptions.order.orderBy]: pageOptions.order.order,
      }

      const [distributionPersistences, total] = await this.distributionRepository.findAndCount({
        where: { assetId },
        relations: ["asset"],
        skip,
        take,
        order,
      })

      const distributions = distributionPersistences.map((persistence) => persistence.toDistribution())

      return {
        items: distributions,
        total,
        page: pageOptions.page,
        limit: pageOptions.limit,
        totalPages: Math.ceil(total / pageOptions.limit),
      }
    } catch (error) {
      throw new DistributionRepositoryError(
        DistributionRepositoryError.ERRORS.GET_DISTRIBUTIONS_BY_ASSET(assetId),
        error,
      )
    }
  }

  async getScheduledAutomatedDistributionsByEvmAddress(evmAddress: string): Promise<Distribution[]> {
    const distributionPersistences = await this.distributionRepository.find({
      where: {
        asset: { lifeCycleCashFlowEvmAddress: evmAddress.toLowerCase() },
        type: DistributionType.PAYOUT,
        subtype: PayoutSubtype.AUTOMATED,
        status: DistributionStatus.SCHEDULED,
      },
      relations: ["asset"],
    })
    return distributionPersistences.map((persistence) => persistence.toDistribution())
  }
}
