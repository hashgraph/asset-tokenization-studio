// SPDX-License-Identifier: Apache-2.0

import { ConfigurationModule } from "@config/configuration.module"
import { ENTITIES, PostgresModule } from "@config/postgres.module"
import { Asset } from "@domain/model/asset"
import { Distribution, DistributionStatus, DistributionType } from "@domain/model/distribution"
import { OrderPageOptions, PageOptions } from "@domain/model/page"
import { faker } from "@faker-js/faker"
import { DistributionRepositoryError } from "@infrastructure/adapters/repositories/errors/distribution.repository.error"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { DistributionTypeOrmRepository } from "@infrastructure/adapters/repositories/typeorm-distribution.repository"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { AssetUtils } from "@test/shared/asset.utils"
import { PostgreSqlContainer } from "@test/shared/containers/postgresql-container"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { TestConstants } from "@test/shared/utils"
import crypto from "crypto"
import { Repository } from "typeorm"

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000
const TWO_DAYS_IN_MS = 2 * ONE_DAY_IN_MS

describe(DistributionTypeOrmRepository.name, () => {
  let distributionRepository: DistributionTypeOrmRepository
  let internalDistributionRepository: Repository<DistributionPersistence>
  let internalAssetRepository: Repository<AssetPersistence>
  let container: PostgreSqlContainer

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigurationModule.forRoot("/.env.test"), PostgresModule.forRoot(container.getConfig(), ENTITIES)],
      providers: [DistributionTypeOrmRepository],
    }).compile()

    distributionRepository = module.get<DistributionTypeOrmRepository>(DistributionTypeOrmRepository)
    internalAssetRepository = module.get<Repository<AssetPersistence>>(getRepositoryToken(AssetPersistence))
    internalDistributionRepository = module.get<Repository<DistributionPersistence>>(
      getRepositoryToken(DistributionPersistence),
    )
  }, TestConstants.BEFORE_ALL_TIMEOUT)

  afterAll(async () => {
    await container.stop()
  }, TestConstants.AFTER_ALL_TIMEOUT)

  afterEach(async () => {
    await internalDistributionRepository.deleteAll()
    await internalAssetRepository.deleteAll()
  })

  describe("saveDistribution", () => {
    it("should save a distribution successfully", async () => {
      const asset = await saveAsset()
      const distribution = DistributionUtils.newInstance({ asset })

      await expect(distributionRepository.saveDistribution(distribution)).resolves.toEqual(distribution)
    })

    it("should throw DistributionRepositoryError when saving distribution fails", async () => {
      const asset = await saveAsset()
      const distribution = DistributionUtils.newInstance({ asset })
      const error = new Error("Database error")
      jest.spyOn(internalDistributionRepository, "save").mockRejectedValueOnce(error)

      await expect(distributionRepository.saveDistribution(distribution)).rejects.toThrow(
        new DistributionRepositoryError(DistributionRepositoryError.ERRORS.SAVE_DISTRIBUTION(distribution), error),
      )
    })

    it("should update a distribution successfully", async () => {
      const asset = await saveAsset()
      const distribution = DistributionUtils.newInstance({ asset })
      const twoDaysAfter = new Date(new Date().getTime() + TWO_DAYS_IN_MS)
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distribution))
      const corporateActionId = (distribution.details as any).corporateActionId
      const updatedDistribution = Distribution.createExistingCorporateAction(
        distribution.id,
        distribution.asset,
        corporateActionId,
        twoDaysAfter,
        DistributionStatus.IN_PROGRESS,
        distribution.createdAt,
        new Date(),
      )
      await expect(distributionRepository.saveDistribution(updatedDistribution)).resolves.toEqual(updatedDistribution)
      const found = await internalDistributionRepository.findOne({
        where: { id: distribution.id },
      })
      expect(found.status).toBe(DistributionStatus.IN_PROGRESS)
      expect(found.executionDate.toISOString()).toBe((updatedDistribution.details as any).executionDate.toISOString())
    })
  })

  describe("getDistribution", () => {
    it("should get a distribution by id successfully", async () => {
      const asset = await saveAsset()
      const distribution = DistributionUtils.newInstance({ asset })
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distribution))
      const found = await distributionRepository.getDistribution(distribution.id)
      expect(found).toEqual(distribution)
    })

    it("should throw DistributionRepositoryError when getting distribution by id fails", async () => {
      const id = crypto.randomUUID()
      const error = new Error("Database error")
      jest.spyOn(internalDistributionRepository, "findOne").mockRejectedValueOnce(error)

      await expect(distributionRepository.getDistribution(id)).rejects.toThrow(
        new DistributionRepositoryError(DistributionRepositoryError.ERRORS.GET_DISTRIBUTION(id), error),
      )
    })

    it("should return null if distribution is not found by id", async () => {
      const found = await distributionRepository.getDistribution(crypto.randomUUID())
      expect(found).toBeNull()
    })
  })

  describe("getAllDistributionsByAssetId", () => {
    it("should get distributions by assetId successfully", async () => {
      const asset = await saveAsset()
      const distribution1 = DistributionUtils.newInstance({ asset })
      const distribution2 = DistributionUtils.newInstance({ asset })
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distribution1))
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distribution2))

      const found = await distributionRepository.getAllDistributionsByAssetId(asset.id)
      expect(found).toHaveLength(2)
      expect(found).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: distribution1.id }),
          expect.objectContaining({ id: distribution2.id }),
        ]),
      )
    })

    it("should throw DistributionRepositoryError when getting distributions by assetId fails", async () => {
      const assetId = crypto.randomUUID()
      const error = new Error("Database error")
      jest.spyOn(internalDistributionRepository, "find").mockRejectedValueOnce(error)

      await expect(distributionRepository.getAllDistributionsByAssetId(assetId)).rejects.toThrow(
        new DistributionRepositoryError(DistributionRepositoryError.ERRORS.GET_DISTRIBUTIONS_BY_ASSET(assetId), error),
      )
    })

    it("should return an empty array if no distributions are found by assetId", async () => {
      const found = await distributionRepository.getAllDistributionsByAssetId(crypto.randomUUID())
      expect(found).toEqual([])
    })
  })

  describe("findByCorporateActionId", () => {
    it("should return a distribution by assetId and corporate action ID", async () => {
      const asset = await saveAsset()
      const distribution = await saveDistribution(asset)

      const corporateActionId = (distribution.details as any).corporateActionId.value
      const foundDistribution = await distributionRepository.findByCorporateActionId(
        distribution.asset.id,
        corporateActionId,
      )

      expect(foundDistribution).toEqual(distribution)
    })

    it("should return null when no distribution matches the assetId and corporate action ID", async () => {
      const assetId = crypto.randomUUID()
      const corporateActionId = faker.string.uuid()

      const found = await distributionRepository.findByCorporateActionId(assetId, corporateActionId)

      expect(found).toBeNull()
    })

    it("should return null when corporate action ID exists but for different asset", async () => {
      const asset1 = await saveAsset()
      const asset2 = await saveAsset()
      const distribution = await saveDistribution(asset1)

      const corporateActionId = (distribution.details as any).corporateActionId.value
      const found = await distributionRepository.findByCorporateActionId(asset2.id, corporateActionId)

      expect(found).toBeNull()
    })

    it("should throw DistributionRepositoryError when getting by corporate action ID fails", async () => {
      const assetId = crypto.randomUUID()
      const corporateActionId = crypto.randomUUID()
      const error = new Error("Database error")
      jest.spyOn(internalDistributionRepository, "findOne").mockRejectedValueOnce(error)

      await expect(distributionRepository.findByCorporateActionId(assetId, corporateActionId)).rejects.toThrow(
        new DistributionRepositoryError(
          DistributionRepositoryError.ERRORS.GET_DISTRIBUTION_BY_CORP_ACTION(assetId, corporateActionId),
          error,
        ),
      )
    })
  })

  describe("updateDistribution", () => {
    it("should update a distribution successfully", async () => {
      const asset = await saveAsset()
      const distribution = await saveDistribution(asset)
      const updatedExecutionDate = new Date(new Date().getTime() + TWO_DAYS_IN_MS)
      const corporateActionId = (distribution.details as any).corporateActionId
      const updatedDistribution = Distribution.createExistingCorporateAction(
        distribution.id,
        distribution.asset,
        corporateActionId,
        updatedExecutionDate,
        DistributionStatus.IN_PROGRESS,
        distribution.createdAt,
        distribution.updatedAt,
      )

      await distributionRepository.updateDistribution(updatedDistribution)

      const found = await internalDistributionRepository.findOne({
        where: { id: distribution.id },
      })
      expect(found).toBeDefined()
      const originalCorporateActionId = (distribution.details as any).corporateActionId.value
      expect(found.corporateActionID).toEqual(originalCorporateActionId)
      expect(found.status).toEqual(DistributionStatus.IN_PROGRESS)
      expect(found.executionDate).toEqual(updatedExecutionDate)
    })

    it("should throw DistributionRepositoryError when updating distribution fails", async () => {
      const asset = await saveAsset()
      const distribution = DistributionUtils.newInstance({ asset })
      const error = new Error("Database error")
      jest.spyOn(internalDistributionRepository, "save").mockRejectedValueOnce(error)

      await expect(distributionRepository.updateDistribution(distribution)).rejects.toThrow(
        new DistributionRepositoryError(DistributionRepositoryError.ERRORS.UPDATE_DISTRIBUTION(distribution), error),
      )
    })

    it("should update distribution status from SCHEDULED to COMPLETED", async () => {
      const asset = await saveAsset()
      const distribution = DistributionUtils.newInstance({
        asset,
        status: DistributionStatus.SCHEDULED,
      })
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distribution))
      const corporateActionId = (distribution.details as any).corporateActionId
      const executionDate = (distribution.details as any).executionDate
      const updatedDistribution = Distribution.createExistingCorporateAction(
        distribution.id,
        distribution.asset,
        corporateActionId,
        executionDate,
        DistributionStatus.COMPLETED,
        distribution.createdAt,
        new Date(),
      )

      await distributionRepository.updateDistribution(updatedDistribution)

      const found = await internalDistributionRepository.findOne({
        where: { id: distribution.id },
      })
      expect(found.status).toBe(DistributionStatus.COMPLETED)
    })

    it("should preserve original createdAt when updating distribution", async () => {
      const asset = await saveAsset()
      const distribution = await saveDistribution(asset)
      const originalCreatedAt = distribution.createdAt
      const corporateActionId = (distribution.details as any).corporateActionId
      const executionDate = (distribution.details as any).executionDate
      const updatedDistribution = Distribution.createExistingCorporateAction(
        distribution.id,
        distribution.asset,
        corporateActionId,
        executionDate,
        DistributionStatus.COMPLETED,
        distribution.createdAt,
        new Date(),
      )

      await distributionRepository.updateDistribution(updatedDistribution)

      const found = await internalDistributionRepository.findOne({
        where: { id: distribution.id },
      })
      expect(found.createdAt).toEqual(originalCreatedAt)
      expect(found.updatedAt).not.toEqual(found.createdAt)
    })
  })

  describe("findByExecutionDateRange", () => {
    it("should return all distributions within the execution date range", async () => {
      const asset = await saveAsset()
      const baseDate = faker.date.future({ years: 9 })
      const startDate = new Date(baseDate.getTime() - ONE_DAY_IN_MS)
      const middleDate = new Date(baseDate.getTime())
      const endDate = new Date(baseDate.getTime() + ONE_DAY_IN_MS)
      const outsideDate = new Date(baseDate.getTime() + TWO_DAYS_IN_MS)
      const distributionInRange1 = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          executionDate: middleDate,
        } as any,
      })
      const distributionInRange2 = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          executionDate: startDate,
        } as any,
      })
      const distributionInRange3 = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          executionDate: endDate,
        } as any,
      })
      const distributionOutOfRange = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          executionDate: outsideDate,
        } as any,
      })
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distributionInRange1))
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distributionInRange2))
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distributionInRange3))
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distributionOutOfRange))

      const found = await distributionRepository.findByExecutionDateRange(startDate, endDate)

      expect(found).toHaveLength(3)
      expect(found).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: distributionInRange1.id }),
          expect.objectContaining({ id: distributionInRange2.id }),
          expect.objectContaining({ id: distributionInRange3.id }),
        ]),
      )
      expect(found).not.toContainEqual(expect.objectContaining({ id: distributionOutOfRange.id }))
    })

    it("should return distributions within the execution date range filtered by status", async () => {
      const asset = await saveAsset()
      const baseDate = faker.date.future({ years: 9 })
      const startDate = new Date(baseDate.getTime() - ONE_DAY_IN_MS)
      const endDate = new Date(baseDate.getTime() + ONE_DAY_IN_MS)
      const distributionScheduled = DistributionUtils.newInstance({
        asset,
        status: DistributionStatus.SCHEDULED,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          executionDate: new Date(baseDate.getTime()),
        } as any,
      })
      const distributionInProgress = DistributionUtils.newInstance({
        asset,
        status: DistributionStatus.IN_PROGRESS,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          executionDate: new Date(baseDate.getTime()),
        } as any,
      })
      const distributionCompleted = DistributionUtils.newInstance({
        asset,
        status: DistributionStatus.COMPLETED,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          executionDate: new Date(baseDate.getTime()),
        } as any,
      })
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distributionScheduled))
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distributionInProgress))
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distributionCompleted))

      const found = await distributionRepository.findByExecutionDateRange(
        startDate,
        endDate,
        DistributionStatus.SCHEDULED,
      )

      expect(found).toHaveLength(1)
      expect(found).toContainEqual(distributionScheduled)
      expect(found).not.toContainEqual(distributionInProgress)
      expect(found).not.toContainEqual(distributionCompleted)
    })

    it("should throw DistributionRepositoryError if getting distributions by execution date range fails", async () => {
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + ONE_DAY_IN_MS)
      const error = new Error("Database error")
      jest.spyOn(internalDistributionRepository, "find").mockRejectedValueOnce(error)
      await expect(distributionRepository.findByExecutionDateRange(startDate, endDate)).rejects.toThrow(
        new DistributionRepositoryError(
          DistributionRepositoryError.ERRORS.GET_DISTRIBUTIONS_BY_EXECUTION_DATE(startDate, endDate),
          error,
        ),
      )
    })

    it("should return an empty array when no distributions are found within the execution date range", async () => {
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + ONE_DAY_IN_MS)

      const found = await distributionRepository.findByExecutionDateRange(startDate, endDate)

      expect(found).toEqual([])
    })

    it("should return empty array if no distributions match the execution date range and status filter", async () => {
      const asset = await saveAsset()
      const baseDate = faker.date.future({ years: 9 })
      const startDate = new Date(baseDate.getTime() - ONE_DAY_IN_MS)
      const endDate = new Date(baseDate.getTime() + ONE_DAY_IN_MS)
      const distribution = DistributionUtils.newInstance({
        asset,
        status: DistributionStatus.COMPLETED,
      })
      await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distribution))

      const found = await distributionRepository.findByExecutionDateRange(
        startDate,
        endDate,
        DistributionStatus.SCHEDULED,
      )

      expect(found).toHaveLength(0)
    })
  })

  describe("getDistributions", () => {
    it("should return paginated distributions with associated assets", async () => {
      const asset1 = await saveAsset()
      const asset2 = await saveAsset()

      const distribution1 = DistributionUtils.newInstance({
        asset: asset1,
        status: DistributionStatus.SCHEDULED,
      })
      const distribution2 = DistributionUtils.newInstance({
        asset: asset2,
        status: DistributionStatus.COMPLETED,
      })

      await internalDistributionRepository.insert([
        DistributionPersistence.fromDistribution(distribution1),
        DistributionPersistence.fromDistribution(distribution2),
      ])

      const pageOptions: PageOptions = { page: 1, limit: 10, order: { order: "DESC", orderBy: "createdAt" } }
      const result = await distributionRepository.getDistributions(pageOptions)

      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)

      const foundDistribution1 = result.items.find((d) => d.id === distribution1.id)
      expect(foundDistribution1).toBeDefined()
      expect(foundDistribution1?.asset.id).toBe(asset1.id)
      expect(foundDistribution1?.asset.name).toBe(asset1.name)

      const foundDistribution2 = result.items.find((d) => d.id === distribution2.id)
      expect(foundDistribution2).toBeDefined()
      expect(foundDistribution2?.asset.id).toBe(asset2.id)
      expect(foundDistribution2?.asset.name).toBe(asset2.name)
    })

    it("should return paginated distributions with correct pagination", async () => {
      const asset = await saveAsset()
      const distributions = Array.from({ length: 15 }, () => DistributionUtils.newInstance({ asset }))

      await internalDistributionRepository.insert(distributions.map((d) => DistributionPersistence.fromDistribution(d)))

      const pageOptions: PageOptions = { page: 2, limit: 5, order: { order: "DESC", orderBy: "createdAt" } }
      const result = await distributionRepository.getDistributions(pageOptions)

      expect(result.items).toHaveLength(5)
      expect(result.total).toBe(15)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(5)
    })

    it("should respect order options", async () => {
      const asset = await saveAsset()
      const now = new Date()
      const date1 = new Date(now.getTime() + ONE_DAY_IN_MS)
      const date2 = new Date(now.getTime() + TWO_DAYS_IN_MS)
      const date3 = new Date(now.getTime() + 3 * ONE_DAY_IN_MS)

      const distribution1 = DistributionUtils.newInstance({
        asset,
        createdAt: date1,
        updatedAt: date1,
      })
      const distribution2 = DistributionUtils.newInstance({
        asset,
        createdAt: date2,
        updatedAt: date2,
      })
      const distribution3 = DistributionUtils.newInstance({
        asset,
        createdAt: date3,
        updatedAt: date3,
      })

      await internalDistributionRepository.insert([
        DistributionPersistence.fromDistribution(distribution1),
        DistributionPersistence.fromDistribution(distribution2),
        DistributionPersistence.fromDistribution(distribution3),
      ])

      const pageOptions: PageOptions = { page: 1, limit: 10, order: { order: "ASC", orderBy: "createdAt" } }
      const result = await distributionRepository.getDistributions(pageOptions)

      expect(result.items).toHaveLength(3)
      expect(result.items[0].createdAt).toEqual(date1)
      expect(result.items[1].createdAt).toEqual(date2)
      expect(result.items[2].createdAt).toEqual(date3)
    })

    it("should throw DistributionRepositoryError when getting distributions fails", async () => {
      const error = new Error("Database error")
      jest.spyOn(internalDistributionRepository, "findAndCount").mockRejectedValueOnce(error)

      const pageOptions: PageOptions = { page: 1, limit: 10, order: { order: "DESC", orderBy: "createdAt" } }
      await expect(distributionRepository.getDistributions(pageOptions)).rejects.toThrow(
        new DistributionRepositoryError(DistributionRepositoryError.ERRORS.GET_DISTRIBUTIONS(), error),
      )
    })
  })

  describe("getDistributionsByAssetId", () => {
    it("should return first page of distributions with pagination", async () => {
      const asset = await saveAsset()
      const distributions = [
        DistributionUtils.newInstance({ asset }),
        DistributionUtils.newInstance({ asset }),
        DistributionUtils.newInstance({ asset }),
      ]

      for (const distribution of distributions) {
        await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distribution))
      }

      const pageOptions = { page: 1, limit: 2, order: OrderPageOptions.DEFAULT }
      const result = await distributionRepository.getDistributionsByAssetId(asset.id, pageOptions)

      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(3)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(2)
      expect(result.totalPages).toBe(2)
    })

    it("should return empty page when no distributions exist for asset", async () => {
      const asset = await saveAsset()
      const pageOptions = PageOptions.DEFAULT

      const result = await distributionRepository.getDistributionsByAssetId(asset.id, pageOptions)

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(0)
    })

    it("should return second page of distributions", async () => {
      const asset = await saveAsset()
      const distributions = [
        DistributionUtils.newInstance({ asset }),
        DistributionUtils.newInstance({ asset }),
        DistributionUtils.newInstance({ asset }),
      ]

      for (const distribution of distributions) {
        await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distribution))
      }

      const pageOptions = { page: 2, limit: 2, order: OrderPageOptions.DEFAULT }
      const result = await distributionRepository.getDistributionsByAssetId(asset.id, pageOptions)

      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(3)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(2)
      expect(result.totalPages).toBe(2)
    })

    it("should throw error when database fails", async () => {
      const asset = await saveAsset()
      const pageOptions = PageOptions.DEFAULT
      const error = new Error("Database error")
      jest.spyOn(internalDistributionRepository, "findAndCount").mockRejectedValueOnce(error)

      await expect(distributionRepository.getDistributionsByAssetId(asset.id, pageOptions)).rejects.toThrow(
        new DistributionRepositoryError(DistributionRepositoryError.ERRORS.GET_DISTRIBUTIONS_BY_ASSET(asset.id), error),
      )
    })

    it("should order distributions by createdAt DESC by default", async () => {
      const asset = await saveAsset()
      const distributions = [
        DistributionUtils.newInstance({ asset }),
        DistributionUtils.newInstance({ asset }),
        DistributionUtils.newInstance({ asset }),
      ]

      for (let i = 0; i < distributions.length; i++) {
        await internalDistributionRepository.insert(DistributionPersistence.fromDistribution(distributions[i]))
        if (i < distributions.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
      }

      const pageOptions = PageOptions.DEFAULT
      const result = await distributionRepository.getDistributionsByAssetId(asset.id, pageOptions)

      expect(result.items).toHaveLength(3)
      const corporateActionIds = result.items.map((item) => (item.details as any).corporateActionId.value)
      const expectedIds = distributions.map((d) => (d.details as any).corporateActionId.value)
      expect(corporateActionIds).toEqual(expect.arrayContaining(expectedIds))
      expect(expectedIds).toEqual(expect.arrayContaining(corporateActionIds))
    })
  })

  async function saveAsset(): Promise<Asset> {
    const asset = AssetUtils.newInstance()
    await internalAssetRepository.save(AssetPersistence.fromAsset(asset))
    return asset
  }

  async function saveDistribution(asset?: Asset): Promise<Distribution> {
    if (!asset) {
      asset = await saveAsset()
    }
    const distribution = DistributionUtils.newInstance({ asset })
    await internalDistributionRepository.save(DistributionPersistence.fromDistribution(distribution))
    return distribution
  }
})
