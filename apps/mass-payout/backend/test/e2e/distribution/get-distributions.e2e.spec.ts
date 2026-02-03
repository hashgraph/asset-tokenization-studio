// SPDX-License-Identifier: Apache-2.0

import { AssetType } from "@domain/model/asset-type.enum"
import { CorporateActionDetails, DistributionStatus, DistributionType } from "@domain/model/distribution"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { faker } from "@faker-js/faker"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { HttpStatus } from "@nestjs/common"
import { E2eTestApp } from "@test/e2e/shared/e2e-test.app"
import { E2eUtils } from "@test/e2e/shared/e2e-utils"
import { TestConstants } from "@test/e2e/shared/test-constants"
import { AssetUtils } from "@test/shared/asset.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { fakeHederaAddress } from "@test/shared/utils"
import request from "supertest"
import { Repository } from "typeorm"

describe("GET /distributions", () => {
  let e2eTestApp: E2eTestApp
  let internalDistributionRepository: Repository<DistributionPersistence>
  let internalAssetRepository: Repository<AssetPersistence>
  const endpoint = "/distributions"

  beforeAll(async () => {
    try {
      e2eTestApp = await E2eTestApp.create()
      if (!e2eTestApp) {
        throw new Error("E2eTestApp.create() returned undefined")
      }
      internalDistributionRepository = e2eTestApp.getRepository(DistributionPersistence)
      internalAssetRepository = e2eTestApp.getRepository(AssetPersistence)
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
    if (internalDistributionRepository) {
      await E2eUtils.purgeOrRecreate(internalDistributionRepository)
    }
    if (internalAssetRepository) {
      await E2eUtils.purgeOrRecreate(internalAssetRepository)
    }
  }, TestConstants.AFTER_EACH_TIMEOUT)

  it(
    "should return paginated distributions successfully",
    async () => {
      const asset = AssetUtils.newInstance({
        name: "Test Asset",
        type: AssetType.EQUITY,
        hederaTokenAddress: fakeHederaAddress(),
        evmTokenAddress: faker.finance.ethereumAddress(),
        lifeCycleCashFlowHederaAddress: fakeHederaAddress(),
        lifeCycleCashFlowEvmAddress: faker.finance.ethereumAddress(),
        isPaused: false,
      })
      await internalAssetRepository.save(AssetPersistence.fromAsset(asset))

      const executionDate1 = faker.date.future()
      const executionDate2 = faker.date.future()
      const distribution1 = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create("corp-action-1"),
          executionDate: executionDate1,
        },
        status: DistributionStatus.SCHEDULED,
      })
      const distribution2 = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create("corp-action-2"),
          executionDate: executionDate2,
        },
        status: DistributionStatus.COMPLETED,
      })

      await internalDistributionRepository.save([
        DistributionPersistence.fromDistribution(distribution1),
        DistributionPersistence.fromDistribution(distribution2),
      ])

      const response = await request(e2eTestApp.app.getHttpServer())
        .get(endpoint)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        items: [
          {
            id: distribution2.id,
            asset: {
              id: asset.id,
              name: asset.name,
              type: asset.type,
              hederaTokenAddress: asset.hederaTokenAddress,
              evmTokenAddress: asset.evmTokenAddress,
              symbol: asset.symbol,
              lifeCycleCashFlowHederaAddress: asset.lifeCycleCashFlowHederaAddress,
              lifeCycleCashFlowEvmAddress: asset.lifeCycleCashFlowEvmAddress,
              maturityDate: asset.maturityDate,
              isPaused: asset.isPaused,
              syncEnabled: asset.syncEnabled,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
            corporateActionID: (distribution2.details as CorporateActionDetails).corporateActionId.value,
            executionDate: (distribution2.details as CorporateActionDetails).executionDate.toISOString(),
            status: distribution2.status,
            type: distribution2.details.type,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
          {
            id: distribution1.id,
            asset: {
              id: asset.id,
              name: asset.name,
              type: asset.type,
              hederaTokenAddress: asset.hederaTokenAddress,
              evmTokenAddress: asset.evmTokenAddress,
              symbol: asset.symbol,
              lifeCycleCashFlowHederaAddress: asset.lifeCycleCashFlowHederaAddress,
              lifeCycleCashFlowEvmAddress: asset.lifeCycleCashFlowEvmAddress,
              maturityDate: asset.maturityDate,
              isPaused: asset.isPaused,
              syncEnabled: asset.syncEnabled,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
            corporateActionID: (distribution1.details as CorporateActionDetails).corporateActionId.value,
            executionDate: (distribution1.details as CorporateActionDetails).executionDate.toISOString(),
            status: distribution1.status,
            type: distribution1.details.type,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    },
    TestConstants.TEST_TIMEOUT,
  )

  it(
    "should return empty page when no distributions exist",
    async () => {
      const response = await request(e2eTestApp.app.getHttpServer())
        .get(endpoint)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
    },
    TestConstants.TEST_TIMEOUT,
  )

  it(
    "should handle pagination correctly",
    async () => {
      const asset = AssetUtils.newInstance()
      await internalAssetRepository.save(AssetPersistence.fromAsset(asset))

      const distributions = Array.from({ length: 15 }, () => DistributionUtils.newInstance({ asset }))
      await internalDistributionRepository.save(distributions.map((d) => DistributionPersistence.fromDistribution(d)))

      const response = await request(e2eTestApp.app.getHttpServer())
        .get(endpoint)
        .query({ page: 2, limit: 5 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(5)
      expect(response.body.total).toBe(15)
      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(5)
    },
    TestConstants.TEST_TIMEOUT,
  )

  it(
    "should use default pagination when no parameters provided",
    async () => {
      const asset = AssetUtils.newInstance()
      await internalAssetRepository.save(AssetPersistence.fromAsset(asset))

      const distribution = DistributionUtils.newInstance({ asset })
      await internalDistributionRepository.save(DistributionPersistence.fromDistribution(distribution))

      const response = await request(e2eTestApp.app.getHttpServer()).get(endpoint).expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.total).toBe(1)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
    },
    TestConstants.TEST_TIMEOUT,
  )
})
