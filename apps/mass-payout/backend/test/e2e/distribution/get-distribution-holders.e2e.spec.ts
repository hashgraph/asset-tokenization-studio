// SPDX-License-Identifier: Apache-2.0

import { TestConstants } from "@test/e2e/shared/test-constants"
import { Repository } from "typeorm"
import { E2eTestApp } from "@test/e2e/shared/e2e-test.app"
import { faker } from "@faker-js/faker"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { HttpStatus } from "@nestjs/common"
import { E2eUtils } from "@test/e2e/shared/e2e-utils"
import { AssetUtils } from "@test/shared/asset.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { BatchPayoutPersistence } from "@infrastructure/adapters/repositories/model/batch-payout.persistence"
import { HolderPersistence } from "@infrastructure/adapters/repositories/model/holder.persistence"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { HolderStatus } from "@domain/model/holder"
import { fakeHederaAddress } from "@test/shared/utils"
import request from "supertest"

describe("GET /distributions/:distributionId/holders", () => {
  let e2eTestApp: E2eTestApp
  let internalDistributionRepository: Repository<DistributionPersistence>
  let internalAssetRepository: Repository<AssetPersistence>
  let internalBatchPayoutRepository: Repository<BatchPayoutPersistence>
  let internalHolderRepository: Repository<HolderPersistence>

  const baseEndpoint = "/distributions"

  beforeAll(async () => {
    try {
      e2eTestApp = await E2eTestApp.create()
      if (!e2eTestApp) {
        throw new Error("E2eTestApp.create() returned undefined")
      }
      internalDistributionRepository = e2eTestApp.getRepository(DistributionPersistence)
      internalAssetRepository = e2eTestApp.getRepository(AssetPersistence)
      internalBatchPayoutRepository = e2eTestApp.getRepository(BatchPayoutPersistence)
      internalHolderRepository = e2eTestApp.getRepository(HolderPersistence)
    } catch (error) {
      console.error("Error in beforeAll:", error)
      throw error
    }
  }, TestConstants.BEFORE_ALL_TIMEOUT)

  afterAll(async () => {
    if (e2eTestApp) {
      await e2eTestApp.stop()
    }
  }, TestConstants.AFTER_ALL_TIMEOUT)

  afterEach(async () => {
    if (internalHolderRepository) {
      await E2eUtils.purgeOrRecreate(internalHolderRepository)
    }
    if (internalBatchPayoutRepository) {
      await E2eUtils.purgeOrRecreate(internalBatchPayoutRepository)
    }
    if (internalDistributionRepository) {
      await E2eUtils.purgeOrRecreate(internalDistributionRepository)
    }
    if (internalAssetRepository) {
      await E2eUtils.purgeOrRecreate(internalAssetRepository)
    }
  })

  const createTestData = async () => {
    // Create asset
    const asset = AssetUtils.newInstance()
    await internalAssetRepository.save(AssetPersistence.fromAsset(asset))

    // Create distribution
    const distribution = DistributionUtils.newInstance({ asset })
    await internalDistributionRepository.save(DistributionPersistence.fromDistribution(distribution))

    // Create batch payout
    const batchPayout = BatchPayoutUtils.newInstance({ distribution })
    await internalBatchPayoutRepository.save(BatchPayoutPersistence.fromBatchPayout(batchPayout))

    const holders = [
      {
        id: faker.string.uuid(),
        batchPayoutId: batchPayout.id,
        holderHederaAddress: fakeHederaAddress(),
        holderEvmAddress: faker.finance.ethereumAddress(),
        retryCounter: 1,
        status: HolderStatus.FAILED,
        lastError: "Insufficient balance",
        nextRetryAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: faker.string.uuid(),
        batchPayoutId: batchPayout.id,
        holderHederaAddress: fakeHederaAddress(),
        holderEvmAddress: faker.finance.ethereumAddress(),
        retryCounter: 2,
        status: HolderStatus.SUCCESS,
        amount: "100.99",
        lastError: "Network error",
        nextRetryAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await internalHolderRepository.save(holders)

    return { distribution, batchPayout, holders }
  }

  it("should return paginated holders for a distribution", async () => {
    // Arrange
    const { distribution, holders } = await createTestData()
    const endpoint = `${baseEndpoint}/${distribution.id}/holders`
    const page = 1
    const limit = 10

    // Act
    const response = await request(e2eTestApp.app.getHttpServer())
      .get(endpoint)
      .query({ page, limit, order: "DESC", orderBy: "createdAt" })
      .expect(HttpStatus.OK)

    // Assert
    expect(response.body).toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({
          id: holders[0].id,
          holderHederaAddress: holders[0].holderHederaAddress,
          holderEvmAddress: holders[0].holderEvmAddress,
          retryCounter: holders[0].retryCounter,
          status: holders[0].status,
          lastError: holders[0].lastError,
          createdAt: holders[0].createdAt.toISOString(),
          updatedAt: holders[0].updatedAt.toISOString(),
        }),
        expect.objectContaining({
          id: holders[1].id,
          holderHederaAddress: holders[1].holderHederaAddress,
          holderEvmAddress: holders[1].holderEvmAddress,
          retryCounter: holders[1].retryCounter,
          status: holders[1].status,
          amount: holders[1].amount,
          lastError: holders[1].lastError,
          createdAt: holders[1].createdAt.toISOString(),
          updatedAt: holders[1].updatedAt.toISOString(),
        }),
      ]),
      total: 2,
      page,
      limit,
      totalPages: 1,
    })
  })

  it("should return empty page when no holders exist for distribution", async () => {
    // Arrange
    const asset = AssetUtils.newInstance()
    await internalAssetRepository.save(AssetPersistence.fromAsset(asset))

    const distribution = DistributionUtils.newInstance({ asset })
    await internalDistributionRepository.save(DistributionPersistence.fromDistribution(distribution))

    const endpoint = `${baseEndpoint}/${distribution.id}/holders`
    const page = 1
    const limit = 10

    // Act
    const response = await request(e2eTestApp.app.getHttpServer())
      .get(endpoint)
      .query({ page, limit })
      .expect(HttpStatus.OK)

    // Assert
    expect(response.body).toEqual({
      items: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    })
  })

  it("should return 404 when distribution does not exist", async () => {
    // Arrange
    const nonExistentId = faker.string.uuid()
    const endpoint = `${baseEndpoint}/${nonExistentId}/holders`

    // Act & Assert
    await request(e2eTestApp.app.getHttpServer())
      .get(endpoint)
      .query({ page: 1, limit: 10 })
      .expect(HttpStatus.NOT_FOUND)
  })

  it("should respect pagination parameters", async () => {
    // Arrange
    const { distribution } = await createTestData()
    const endpoint = `${baseEndpoint}/${distribution.id}/holders`
    const page = 1
    const limit = 1

    // Act
    const response = await request(e2eTestApp.app.getHttpServer())
      .get(endpoint)
      .query({ page, limit })
      .expect(HttpStatus.OK)

    // Assert
    expect(response.body).toMatchObject({
      items: expect.any(Array),
      total: 2, // We created 2 holders
      page,
      limit,
      totalPages: 2,
    })
    expect(response.body.items).toHaveLength(1) // Should return only 1 item due to limit=1
  })
})
