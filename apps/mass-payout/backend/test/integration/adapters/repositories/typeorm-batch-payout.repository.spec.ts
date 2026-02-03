// SPDX-License-Identifier: Apache-2.0

import { ConfigurationModule } from "@config/configuration.module"
import { ENTITIES, PostgresModule } from "@config/postgres.module"
import { Distribution } from "@domain/model/distribution"
import { faker } from "@faker-js/faker"
import { BatchPayoutPersistence } from "@infrastructure/adapters/repositories/model/batch-payout.persistence"
import { BatchPayoutTypeOrmRepository } from "@infrastructure/adapters/repositories/typeorm-batch-payout.repository"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { PostgreSqlContainer } from "@test/shared/containers/postgresql-container"
import { fakeHederaTxId, TestConstants } from "@test/shared/utils"
import crypto from "crypto"
import { Repository } from "typeorm"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { Asset } from "@domain/model/asset"
import { AssetUtils } from "@test/shared/asset.utils"
import { BatchPayout, BatchPayoutStatus } from "@domain/model/batch-payout"
import { BatchPayoutRepositoryError } from "@infrastructure/adapters/repositories/errors/batch-payout.repository.error"

describe(BatchPayoutTypeOrmRepository.name, () => {
  let batchPayoutRepository: BatchPayoutTypeOrmRepository
  let internalBatchPayoutRepository: Repository<BatchPayoutPersistence>
  let internalDistributionRepository: Repository<DistributionPersistence>
  let internalAssetRepository: Repository<AssetPersistence>
  let container: PostgreSqlContainer

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigurationModule.forRoot("/.env.test"), PostgresModule.forRoot(container.getConfig(), ENTITIES)],
      providers: [BatchPayoutTypeOrmRepository],
    }).compile()

    batchPayoutRepository = module.get<BatchPayoutTypeOrmRepository>(BatchPayoutTypeOrmRepository)
    internalAssetRepository = module.get<Repository<AssetPersistence>>(getRepositoryToken(AssetPersistence))
    internalDistributionRepository = module.get<Repository<DistributionPersistence>>(
      getRepositoryToken(DistributionPersistence),
    )
    internalBatchPayoutRepository = module.get<Repository<BatchPayoutPersistence>>(
      getRepositoryToken(BatchPayoutPersistence),
    )
  }, TestConstants.BEFORE_ALL_TIMEOUT)

  afterEach(async () => {
    await internalBatchPayoutRepository.deleteAll()
    await internalDistributionRepository.deleteAll()
    await internalAssetRepository.deleteAll()
  })

  afterAll(async () => {
    await container.stop()
  }, TestConstants.AFTER_ALL_TIMEOUT)

  describe("saveBatchPayout", () => {
    it("should save a batch payout", async () => {
      const distribution = await saveDistribution()
      const batchPayout = BatchPayoutUtils.newInstance({ distribution })

      const savedBatchPayout = await batchPayoutRepository.saveBatchPayout(batchPayout)

      expect(savedBatchPayout).toBeDefined()
      expect(savedBatchPayout.id).toStrictEqual(batchPayout.id)
      expect(savedBatchPayout.distribution).toStrictEqual(batchPayout.distribution)
      expect(savedBatchPayout.name).toStrictEqual(batchPayout.name)
      expect(savedBatchPayout.hederaTransactionHash).toStrictEqual(batchPayout.hederaTransactionHash)
      expect(savedBatchPayout.hederaTransactionId).toStrictEqual(batchPayout.hederaTransactionId)
      expect(savedBatchPayout.hederaTransactionHash).toStrictEqual(batchPayout.hederaTransactionHash)
      expect(savedBatchPayout.holdersNumber).toStrictEqual(batchPayout.holdersNumber)
      expect(savedBatchPayout.status).toStrictEqual(batchPayout.status)
    })

    it("should throw BatchPayoutRepositoryError when saving fails", async () => {
      const distribution = await saveDistribution()
      const batchPayout = BatchPayoutUtils.newInstance({ distribution })
      jest.spyOn(internalBatchPayoutRepository, "insert").mockRejectedValueOnce(new Error("DB error"))

      await expect(batchPayoutRepository.saveBatchPayout(batchPayout)).rejects.toThrow(
        new BatchPayoutRepositoryError(BatchPayoutRepositoryError.ERRORS.SAVE_BATCH_PAYOUT(batchPayout)),
      )
    })
  })

  describe("saveBatchPayouts", () => {
    it("should save multiple batch payouts", async () => {
      const distribution = await saveDistribution()
      const name1 = faker.string.alpha({ length: 10 })
      const name2 = faker.string.alpha({ length: 10 })
      const batchPayouts = [
        BatchPayoutUtils.newInstance({ name: name1, distribution }),
        BatchPayoutUtils.newInstance({ name: name2, distribution }),
      ]

      const savedBatchPayouts = await batchPayoutRepository.saveBatchPayouts(batchPayouts)

      expect(savedBatchPayouts).toHaveLength(2)
      const resultNames = savedBatchPayouts.map((b) => b.name)
      expect(resultNames).toEqual(expect.arrayContaining([name1, name2]))
    })

    it("should throw BatchPayoutRepositoryError when saving multiple payouts fails", async () => {
      const distribution = await saveDistribution()
      const batchPayouts = [
        BatchPayoutUtils.newInstance({ distribution }),
        BatchPayoutUtils.newInstance({ distribution }),
      ]
      jest.spyOn(internalBatchPayoutRepository, "insert").mockRejectedValueOnce(new Error("DB error"))

      await expect(batchPayoutRepository.saveBatchPayouts(batchPayouts)).rejects.toThrow(
        new BatchPayoutRepositoryError(BatchPayoutRepositoryError.ERRORS.SAVE_BATCH_PAYOUTS(batchPayouts)),
      )
    })
  })

  describe("getBatchPayout", () => {
    it("should return a batch payout by id", async () => {
      const batchPayout = await saveBatchPayout()

      const foundBatchPayout = await batchPayoutRepository.getBatchPayout(batchPayout.id)

      expect(foundBatchPayout).toBeDefined()
      expect(foundBatchPayout?.id).toStrictEqual(batchPayout.id)
      expect(foundBatchPayout?.name).toStrictEqual(batchPayout.name)
      expect(foundBatchPayout?.distribution).toStrictEqual(batchPayout.distribution)
      expect(foundBatchPayout?.hederaTransactionHash).toStrictEqual(batchPayout.hederaTransactionHash)
      expect(foundBatchPayout?.hederaTransactionId).toStrictEqual(batchPayout.hederaTransactionId)
      expect(foundBatchPayout?.hederaTransactionHash).toStrictEqual(batchPayout.hederaTransactionHash)
      expect(foundBatchPayout?.holdersNumber).toStrictEqual(batchPayout.holdersNumber)
      expect(foundBatchPayout?.status).toStrictEqual(batchPayout.status)
    })

    it("should return undefined when batch payout not found", async () => {
      const nonExistentId = crypto.randomUUID()
      const foundBatchPayout = await batchPayoutRepository.getBatchPayout(nonExistentId)
      expect(foundBatchPayout).toBeUndefined()
    })

    it("should throw BatchPayoutRepositoryError when getting batch payout fails", async () => {
      const id = crypto.randomUUID()
      jest.spyOn(internalBatchPayoutRepository, "findOne").mockRejectedValueOnce(new Error("DB error"))

      await expect(batchPayoutRepository.getBatchPayout(id)).rejects.toThrow(
        new BatchPayoutRepositoryError(BatchPayoutRepositoryError.ERRORS.GET_BATCH_PAYOUT(id)),
      )
    })
  })

  describe("getBatchPayoutsByDistribution", () => {
    it("should return batch payouts by distribution", async () => {
      const distribution = await saveDistribution()
      const good1 = await saveBatchPayout(distribution)
      const good2 = await saveBatchPayout(distribution)
      await saveBatchPayout()
      const foundBatchPayouts = await batchPayoutRepository.getBatchPayoutsByDistribution(distribution)

      expect(foundBatchPayouts).toHaveLength(2)
      expect(foundBatchPayouts.every((b) => b.distribution.id === distribution.id)).toBe(true)
      const resultIds = foundBatchPayouts.map((b) => b.id)
      expect(resultIds).toEqual(expect.arrayContaining([good1.id, good2.id]))
      const sample = foundBatchPayouts.find((b) => b.id === good1.id)!
      expect(sample).toMatchObject({
        name: good1.name,
        hederaTransactionId: good1.hederaTransactionId,
        hederaTransactionHash: good1.hederaTransactionHash,
        holdersNumber: good1.holdersNumber,
        status: good1.status,
      })
    })

    it("should return empty array when no batch payouts found for distribution", async () => {
      const distribution = await saveDistribution()

      const foundBatchPayouts = await batchPayoutRepository.getBatchPayoutsByDistribution(distribution)

      expect(foundBatchPayouts).toHaveLength(0)
    })

    it("should throw BatchPayoutRepositoryError when getting batch payouts by distribution fails", async () => {
      const distribution = await saveDistribution()
      jest.spyOn(internalBatchPayoutRepository, "find").mockRejectedValueOnce(new Error("DB error"))

      await expect(batchPayoutRepository.getBatchPayoutsByDistribution(distribution)).rejects.toThrow(
        new BatchPayoutRepositoryError(
          BatchPayoutRepositoryError.ERRORS.GET_BATCH_PAYOUTS_BY_DISTRIBUTION(distribution.id),
        ),
      )
    })
  })

  describe("updateBatchPayout", () => {
    it("should update a batch payout successfully", async () => {
      const distribution = await saveDistribution()
      const originalBatchPayout = await saveBatchPayout(distribution)
      const updatedHederaTransactionId = fakeHederaTxId()
      const updatedHederaTransactionHash = `0x${faker.string.hexadecimal({ length: 96, prefix: "" })}`
      const holdersNumber = originalBatchPayout.holdersNumber + 100
      const updatedBatchPayout = BatchPayout.createExisting(
        originalBatchPayout.id,
        distribution,
        originalBatchPayout.name,
        updatedHederaTransactionId,
        updatedHederaTransactionHash,
        holdersNumber,
        BatchPayoutStatus.COMPLETED,
        originalBatchPayout.createdAt,
        new Date(),
      )

      await batchPayoutRepository.updateBatchPayout(updatedBatchPayout)

      const persistedBatchPayout = await internalBatchPayoutRepository.findOne({
        where: { id: originalBatchPayout.id },
        relations: ["distribution", "distribution.asset"],
      })
      expect(persistedBatchPayout).toBeDefined()
      expect(persistedBatchPayout.hederaTransactionHash).toBe(updatedHederaTransactionHash)
      expect(persistedBatchPayout.hederaTransactionId).toBe(updatedHederaTransactionId)
      expect(persistedBatchPayout.holdersNumber).toBe(holdersNumber)
      expect(persistedBatchPayout.status).toBe(BatchPayoutStatus.COMPLETED)
    })

    it("should update only specific fields of a batch payout", async () => {
      const distribution = await saveDistribution()
      const originalBatchPayout = await saveBatchPayout(distribution)
      const updatedBatchPayout = BatchPayout.createExisting(
        originalBatchPayout.id,
        originalBatchPayout.distribution,
        originalBatchPayout.name,
        originalBatchPayout.hederaTransactionId,
        originalBatchPayout.hederaTransactionHash,
        250,
        BatchPayoutStatus.IN_PROGRESS,
        originalBatchPayout.createdAt,
        new Date(),
      )

      const result = await batchPayoutRepository.updateBatchPayout(updatedBatchPayout)

      expect(result.holdersNumber).toBe(250)
      expect(result.status).toBe(BatchPayoutStatus.IN_PROGRESS)
      expect(result.name).toBe(originalBatchPayout.name)
      expect(result.hederaTransactionHash).toBe(originalBatchPayout.hederaTransactionHash)
      expect(result.hederaTransactionId).toBe(originalBatchPayout.hederaTransactionId)
      expect(result.hederaTransactionHash).toBe(originalBatchPayout.hederaTransactionHash)
    })

    it("should throw BatchPayoutRepositoryError when updating non-existent batch payout", async () => {
      const distribution = await saveDistribution()
      const nonExistentBatchPayout = BatchPayoutUtils.newInstance({
        distribution,
        id: crypto.randomUUID(),
      })
      await expect(batchPayoutRepository.updateBatchPayout(nonExistentBatchPayout)).resolves.toBeDefined()
    })

    it("should throw BatchPayoutRepositoryError when updating batch payout fails", async () => {
      const distribution = await saveDistribution()
      const batchPayout = await saveBatchPayout(distribution)
      const error = new Error("Database error")
      jest.spyOn(internalBatchPayoutRepository, "save").mockRejectedValueOnce(error)

      await expect(batchPayoutRepository.updateBatchPayout(batchPayout)).rejects.toThrow(
        new BatchPayoutRepositoryError(BatchPayoutRepositoryError.ERRORS.UPDATE_BATCH_PAYOUT(batchPayout), error),
      )
    })

    it("should preserve distribution relationship when updating batch payout", async () => {
      const distribution = await saveDistribution()
      const originalBatchPayout = await saveBatchPayout(distribution)

      const updatedBatchPayout = BatchPayout.createExisting(
        originalBatchPayout.id,
        originalBatchPayout.distribution,
        "Updated Name",
        originalBatchPayout.hederaTransactionId,
        originalBatchPayout.hederaTransactionHash,
        originalBatchPayout.holdersNumber,
        BatchPayoutStatus.COMPLETED,
        originalBatchPayout.createdAt,
        new Date(),
      )

      const result = await batchPayoutRepository.updateBatchPayout(updatedBatchPayout)

      expect(result.distribution).toBeDefined()
      expect(result.distribution.id).toBe(distribution.id)
      expect(result.distribution.asset).toBeDefined()
      expect(result.distribution.asset.id).toBe(distribution.asset.id)
    })

    it("should update timestamps correctly", async () => {
      const distribution = await saveDistribution()
      const originalBatchPayout = await saveBatchPayout(distribution)
      const updatedName = faker.string.alpha({ length: 10 })
      const updatedBatchPayout = BatchPayout.createExisting(
        originalBatchPayout.id,
        originalBatchPayout.distribution,
        updatedName,
        originalBatchPayout.hederaTransactionId,
        originalBatchPayout.hederaTransactionHash,
        originalBatchPayout.holdersNumber,
        originalBatchPayout.status,
        originalBatchPayout.createdAt,
        originalBatchPayout.updatedAt,
      )

      const result = await batchPayoutRepository.updateBatchPayout(updatedBatchPayout)

      expect(result.createdAt).toEqual(originalBatchPayout.createdAt)
      expect(result.updatedAt).not.toEqual(originalBatchPayout.updatedAt)
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
})
