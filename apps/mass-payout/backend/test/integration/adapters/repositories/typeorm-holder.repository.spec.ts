// SPDX-License-Identifier: Apache-2.0

import { ConfigurationModule } from "@config/configuration.module"
import { ENTITIES, PostgresModule } from "@config/postgres.module"
import { Asset } from "@domain/model/asset"
import { BatchPayout } from "@domain/model/batch-payout"
import { Distribution } from "@domain/model/distribution"
import { Holder, HolderStatus } from "@domain/model/holder"
import { PageOptions } from "@domain/model/page"
import { faker } from "@faker-js/faker"
import { HolderRepositoryError } from "@infrastructure/adapters/repositories/errors/holder.repository.error"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { BatchPayoutPersistence } from "@infrastructure/adapters/repositories/model/batch-payout.persistence"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { HolderPersistence } from "@infrastructure/adapters/repositories/model/holder.persistence"
import { HolderTypeOrmRepository } from "@infrastructure/adapters/repositories/typeorm-holder.repository"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { AssetUtils } from "@test/shared/asset.utils"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { PostgreSqlContainer } from "@test/shared/containers/postgresql-container"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { HolderUtils } from "@test/shared/holder.utils"
import { TestConstants } from "@test/shared/utils"
import { Repository } from "typeorm"

describe(HolderTypeOrmRepository.name, () => {
  let holderRepository: HolderTypeOrmRepository
  let internalRepository: Repository<HolderPersistence>
  let internalAssetRepository: Repository<AssetPersistence>
  let internalDistributionRepository: Repository<DistributionPersistence>
  let internalBatchPayoutRepository: Repository<BatchPayoutPersistence>
  let container: PostgreSqlContainer

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigurationModule.forRoot("/.env.test"), PostgresModule.forRoot(container.getConfig(), ENTITIES)],
      providers: [HolderTypeOrmRepository],
    }).compile()

    holderRepository = module.get<HolderTypeOrmRepository>(HolderTypeOrmRepository)
    internalRepository = module.get<Repository<HolderPersistence>>(getRepositoryToken(HolderPersistence))
    internalAssetRepository = module.get<Repository<AssetPersistence>>(getRepositoryToken(AssetPersistence))
    internalDistributionRepository = module.get<Repository<DistributionPersistence>>(
      getRepositoryToken(DistributionPersistence),
    )
    internalBatchPayoutRepository = module.get<Repository<BatchPayoutPersistence>>(
      getRepositoryToken(BatchPayoutPersistence),
    )
  }, TestConstants.BEFORE_ALL_TIMEOUT)

  afterAll(async () => {
    await container.stop()
  }, TestConstants.AFTER_ALL_TIMEOUT)

  afterEach(async () => {
    await internalRepository.deleteAll()
    await internalBatchPayoutRepository.deleteAll()
    await internalDistributionRepository.deleteAll()
    await internalAssetRepository.deleteAll()
  })

  describe("saveHolder", () => {
    it("should save a holder successfully", async () => {
      const distribution = await saveDistribution()
      const batchPayout = await saveBatchPayout(distribution)
      const holder = HolderUtils.newInstance({ batchPayout })

      const savedHolder = await holderRepository.saveHolder(holder)

      expect(savedHolder).toStrictEqual(holder)
    })

    it("should throw HolderRepositoryError when saving holder fails", async () => {
      const distribution = await saveDistribution()
      const batchPayout = await saveBatchPayout(distribution)
      const holder = HolderUtils.newInstance({ batchPayout })
      const error = new Error("Database error")
      jest.spyOn(internalRepository, "save").mockRejectedValueOnce(error)

      await expect(holderRepository.saveHolder(holder)).rejects.toThrow(
        new HolderRepositoryError(HolderRepositoryError.ERRORS.SAVE_HOLDER(holder), error),
      )
    })
  })

  describe("saveHolders", () => {
    it("should save multiple holders successfully", async () => {
      const distribution = await saveDistribution()
      const batchPayout = await saveBatchPayout(distribution)
      const holder1 = HolderUtils.newInstance({ batchPayout })
      const holder2 = HolderUtils.newInstance({ batchPayout })
      const holders = [holder1, holder2]

      const savedHolders = await holderRepository.saveHolders(holders)

      expect(savedHolders).toHaveLength(2)

      const savedHolder1 = savedHolders.find((h) => h.id === holder1.id)
      const savedHolder2 = savedHolders.find((h) => h.id === holder2.id)

      expect(savedHolder1).toMatchObject({
        id: holder1.id,
        holderEvmAddress: holder1.holderEvmAddress,
        holderHederaAddress: holder1.holderHederaAddress,
        status: holder1.status,
      })
      expect(savedHolder2).toMatchObject({
        id: holder2.id,
        holderEvmAddress: holder2.holderEvmAddress,
        holderHederaAddress: holder2.holderHederaAddress,
        status: holder2.status,
      })
    })

    it("should throw HolderRepositoryError when saving multiple holders fails", async () => {
      const distribution = await saveDistribution()
      const batchPayout = await saveBatchPayout(distribution)
      const holder1 = HolderUtils.newInstance({ batchPayout })
      const holder2 = HolderUtils.newInstance({ batchPayout })
      const holders = [holder1, holder2]
      const error = new Error("Database error")
      jest.spyOn(internalRepository, "save").mockRejectedValueOnce(error)

      await expect(holderRepository.saveHolders(holders)).rejects.toThrow(
        new HolderRepositoryError(HolderRepositoryError.ERRORS.SAVE_HOLDERS(holders), error),
      )
    })
  })

  describe("getHoldersByDistributionId", () => {
    it("should return paginated holders for a distribution", async () => {
      const distribution = await saveDistribution()
      const batchPayout1 = await saveBatchPayout(distribution)
      const batchPayout2 = await saveBatchPayout(distribution)
      const holder1 = await saveHolder(batchPayout1)
      const holder2 = await saveHolder(batchPayout2)
      const otherDistribution = await saveDistribution()
      const otherBatchPayout = await saveBatchPayout(otherDistribution)
      await saveHolder(otherBatchPayout)
      const pageOptions = PageOptions.DEFAULT

      const result = await holderRepository.getHoldersByDistributionId(distribution.id, pageOptions)

      // Assertions
      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(pageOptions.page)
      expect(result.limit).toBe(pageOptions.limit)
      expect(result.totalPages).toBe(1)

      // Verify the returned items have the correct structure
      const returnedIds = result.items.map((item) => item.id)
      expect(returnedIds).toContain(holder1.id)
      expect(returnedIds).toContain(holder2.id)
    })

    it("should return empty result when no holders exist for distribution", async () => {
      const distribution = await saveDistribution()
      const pageOptions = PageOptions.DEFAULT

      const result = await holderRepository.getHoldersByDistributionId(distribution.id, pageOptions)

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })

    it("should respect pagination parameters", async () => {
      const distribution = await saveDistribution()
      const batchPayout = await saveBatchPayout(distribution)

      const holders = []
      for (let i = 0; i < 5; i++) {
        holders.push(await saveHolder(batchPayout))
      }
      const page1 = await holderRepository.getHoldersByDistributionId(distribution.id, {
        page: 1,
        limit: 2,
        order: { order: "ASC" as const, orderBy: "createdAt" as const },
      })

      // Second page with 2 items
      const page2 = await holderRepository.getHoldersByDistributionId(distribution.id, {
        page: 2,
        limit: 2,
        order: { order: "ASC" as const, orderBy: "createdAt" as const },
      })

      expect(page1.items).toHaveLength(2)
      expect(page2.items).toHaveLength(2)
      expect(page1.total).toBe(5)
      expect(page2.total).toBe(5)
      expect(page1.totalPages).toBe(3) // 5 items / 2 per page = 3 pages

      // Verify no overlap between pages
      const page1Ids = page1.items.map((item) => item.id)
      const page2Ids = page2.items.map((item) => item.id)
      const intersection = page1Ids.filter((id) => page2Ids.includes(id))
      expect(intersection).toHaveLength(0)
    })

    it("should respect ordering", async () => {
      const distribution = await saveDistribution()
      const batchPayout = await saveBatchPayout(distribution)
      for (let i = 0; i < 3; i++) {
        await saveHolder(batchPayout)
      }
      const pageOptionsAsc: PageOptions = {
        page: 1,
        limit: 10,
        order: { order: "ASC" as const, orderBy: "createdAt" as const },
      }
      const pageOptionsDesc: PageOptions = {
        page: 1,
        limit: 10,
        order: { order: "DESC" as const, orderBy: "createdAt" as const },
      }

      // Test ascending order (oldest first)
      const ascResult = await holderRepository.getHoldersByDistributionId(distribution.id, pageOptionsAsc)

      // Test descending order (newest first)
      const descResult = await holderRepository.getHoldersByDistributionId(distribution.id, pageOptionsDesc)

      // Verify order
      const ascTimestamps = ascResult.items.map((item) => item.createdAt.getTime())
      const descTimestamps = descResult.items.map((item) => item.createdAt.getTime())

      // Check if timestamps are in correct order
      for (let i = 1; i < ascTimestamps.length; i++) {
        expect(ascTimestamps[i]).toBeGreaterThanOrEqual(ascTimestamps[i - 1])
      }

      for (let i = 1; i < descTimestamps.length; i++) {
        expect(descTimestamps[i]).toBeLessThanOrEqual(descTimestamps[i - 1])
      }
    })
  })

  describe("updateHolder", () => {
    it("should update a holder successfully", async () => {
      const holder = await saveHolder()
      const updatedHolder = Holder.createExisting(
        holder.id,
        holder.batchPayout,
        holder.holderHederaAddress,
        holder.holderEvmAddress,
        1,
        HolderStatus.RETRYING,
        new Date(),
        "New Error",
        holder.amount,
        holder.createdAt,
        new Date(),
      )

      await expect(holderRepository.updateHolder(updatedHolder)).resolves.toEqual(updatedHolder)

      const found = await internalRepository.findOneBy({ id: holder.id })
      expect(found.retryCounter).toBe(1)
      expect(found.status).toBe(HolderStatus.RETRYING)
    })

    it("should throw HolderRepositoryError when updating holder fails", async () => {
      const holder = await saveHolder()
      const error = new Error("Database error")
      jest.spyOn(internalRepository, "update").mockRejectedValueOnce(error)

      await expect(holderRepository.updateHolder(holder)).rejects.toThrow(
        new HolderRepositoryError(HolderRepositoryError.ERRORS.UPDATE_HOLDER(holder), error),
      )
    })
  })

  describe("getHoldersByBatchPayout", () => {
    it("returns all holders for a specific batch payout", async () => {
      const distribution = await saveDistribution()
      const goodBatch = await saveBatchPayout(distribution)
      const noiseBatch = await saveBatchPayout()
      const goodHolder = await saveHolder(goodBatch)
      const goodHolder2 = await saveHolder(goodBatch)
      await saveHolder(noiseBatch)

      const result = await holderRepository.getHoldersByBatchPayout(goodBatch.id)

      const expectedIds = [goodHolder.id, goodHolder2.id]
      const resultIds = result.map((holder) => holder.id)
      expect(result).toHaveLength(2)
      expect(resultIds.sort()).toEqual(expectedIds.sort())
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ...goodHolder }),
          expect.objectContaining({ ...goodHolder2 }),
        ]),
      )
    })

    it("should throw HolderRepositoryError when getting holders by batch payout fails", async () => {
      const batchPayoutId = faker.string.uuid()
      const error = new Error("Database error")
      jest.spyOn(internalRepository, "find").mockRejectedValueOnce(error)

      await expect(holderRepository.getHoldersByBatchPayout(batchPayoutId)).rejects.toThrow(
        new HolderRepositoryError(HolderRepositoryError.ERRORS.GET_HOLDERS_BY_BATCH_PAYOUT(batchPayoutId), error),
      )
    })
  })

  describe("getHoldersByDistributionId", () => {
    it("returns all holders for a specific distribution", async () => {
      const distribution = await saveDistribution()
      const goodBatch = await saveBatchPayout(distribution)
      const noiseBatch = await saveBatchPayout()
      const goodHolder = await saveHolder(goodBatch)

      await saveHolder(noiseBatch)

      const result = await holderRepository.getAllHoldersByDistributionId(distribution.id)

      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual(goodHolder)
    })

    it("should throw HolderRepositoryError when getting holders by distribution fails", async () => {
      const distributionId = faker.string.uuid()
      const error = new Error("Database error")
      jest.spyOn(internalRepository, "find").mockRejectedValueOnce(error)

      await expect(holderRepository.getAllHoldersByDistributionId(distributionId)).rejects.toThrow(
        new HolderRepositoryError(HolderRepositoryError.ERRORS.GET_HOLDERS_BY_DISTRIBUTION(distributionId), error),
      )
    })
  })

  describe("countHoldersByDistributionId", () => {
    it("returns holders count for a specific distribution", async () => {
      const distribution = await saveDistribution()
      const distribution2 = await saveDistribution()
      const goodBatch = await saveBatchPayout(distribution)
      await saveHolder(goodBatch)

      const result = await holderRepository.countHoldersByDistributionId(distribution.id)

      expect(result).toBe(1)
      expect(await holderRepository.countHoldersByDistributionId(distribution2.id)).toBe(0)
    })

    it("should throw HolderRepositoryError when getting holders count by distribution fails", async () => {
      const distributionId = faker.string.uuid()
      const error = new Error("Database error")
      jest.spyOn(internalRepository, "count").mockRejectedValueOnce(error)

      await expect(holderRepository.countHoldersByDistributionId(distributionId)).rejects.toThrow(
        new HolderRepositoryError(HolderRepositoryError.ERRORS.GET_HOLDER_COUNT_BY_DISTRIBUTION(distributionId), error),
      )
    })
  })

  describe("getHoldersByDistributionIdAndStatus", () => {
    it("returns holders for a specific distribution and status", async () => {
      const distribution = await saveDistribution()
      const batchPayout = await saveBatchPayout(distribution)
      const holder = await saveHolder(batchPayout, HolderStatus.FAILED)
      await saveHolder(batchPayout, HolderStatus.SUCCESS)

      const holders = await holderRepository.getHoldersByDistributionIdAndStatus(distribution.id, HolderStatus.FAILED)

      expect(holders.length).toBe(1)
      expect(holders[0]).toStrictEqual(holder)
    })

    it("should throw HolderRepositoryError when getting holders by distribution and status fails", async () => {
      const distributionId = faker.string.uuid()
      const status = HolderStatus.FAILED
      const error = new Error("Database error")
      jest.spyOn(internalRepository, "find").mockRejectedValueOnce(error)

      await expect(
        holderRepository.getHoldersByDistributionIdAndStatus(distributionId, HolderStatus.FAILED),
      ).rejects.toThrow(
        new HolderRepositoryError(
          HolderRepositoryError.ERRORS.GET_HOLDERS_BY_DISTRIBUTION_AND_STATUS(distributionId, status),
          error,
        ),
      )
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

  async function saveBatchPayout(distribution?: Distribution): Promise<BatchPayout> {
    if (!distribution) {
      distribution = await saveDistribution()
    }
    const batchPayout = BatchPayoutUtils.newInstance({ distribution })
    await internalBatchPayoutRepository.save(BatchPayoutPersistence.fromBatchPayout(batchPayout))
    return batchPayout
  }

  async function saveHolder(batchPayout?: BatchPayout, status: HolderStatus = undefined): Promise<Holder> {
    if (!batchPayout) {
      batchPayout = await saveBatchPayout()
    }
    const holder = HolderUtils.newInstance({ batchPayout, status })
    await internalRepository.save(HolderPersistence.fromHolder(holder))
    return holder
  }
})
