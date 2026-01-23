// SPDX-License-Identifier: Apache-2.0

import { AmountType, DistributionStatus, DistributionType, PayoutSubtype } from "@domain/model/distribution"
import { faker } from "@faker-js/faker"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { HttpStatus } from "@nestjs/common"
import { E2eTestApp } from "@test/e2e/shared/e2e-test.app"
import { E2eUtils } from "@test/e2e/shared/e2e-utils"
import { TestConstants } from "@test/e2e/shared/test-constants"
import { AssetUtils } from "@test/shared/asset.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"
import request from "supertest"
import { Repository } from "typeorm"

describe("PATCH /distributions/:distributionId/cancel", () => {
  let e2eTestApp: E2eTestApp
  let internalDistributionRepository: Repository<DistributionPersistence>
  let internalAssetRepository: Repository<AssetPersistence>
  const baseEndpoint = "/distributions"

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
    "should cancel distribution successfully",
    async () => {
      const asset = AssetUtils.newInstance()
      await internalAssetRepository.save(AssetPersistence.fromAsset(asset))
      const distribution = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.ONE_OFF,
          executeAt: faker.date.future(),
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: faker.helpers.objectValue(AmountType),
        },
        status: DistributionStatus.SCHEDULED,
      })
      await internalDistributionRepository.save(DistributionPersistence.fromDistribution(distribution))

      const endpoint = `${baseEndpoint}/${distribution.id}/cancel`

      await request(e2eTestApp.app.getHttpServer()).patch(endpoint).expect(HttpStatus.OK)

      const updatedDistribution = await internalDistributionRepository.findOneBy({ id: distribution.id })
      expect(updatedDistribution.status).toBe(DistributionStatus.CANCELLED)
    },
    TestConstants.TEST_TIMEOUT,
  )
})
