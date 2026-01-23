// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { AmountType, DistributionType, PayoutSubtype } from "@domain/model/distribution"
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { faker } from "@faker-js/faker"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { CreatePayoutRequest } from "@infrastructure/rest/asset/create-payout.request"
import { HttpStatus } from "@nestjs/common"
import { E2eTestApp } from "@test/e2e/shared/e2e-test.app"
import { E2eUtils } from "@test/e2e/shared/e2e-utils"
import { TestConstants } from "@test/e2e/shared/test-constants"
import { AssetUtils } from "@test/shared/asset.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"
import request from "supertest"
import { Repository } from "typeorm"

describe("POST /assets/:assetId/distributions/payout", () => {
  let e2eTestApp: E2eTestApp
  let internalAssetRepository: Repository<AssetPersistence>
  let internalDistributionRepository: Repository<DistributionPersistence>

  let asset: Asset

  beforeAll(async () => {
    try {
      e2eTestApp = await E2eTestApp.create()
      if (!e2eTestApp) {
        throw new Error("E2eTestApp.create() returned undefined")
      }
      internalAssetRepository = e2eTestApp.getRepository(AssetPersistence)
      internalDistributionRepository = e2eTestApp.getRepository(DistributionPersistence)
    } catch (error) {
      console.error("Error in beforeAll:", error)
      throw error
    }
  }, TestConstants.BEFORE_ALL_TIMEOUT)

  beforeEach(async () => {
    asset = AssetUtils.newInstance()
    await internalAssetRepository.save(asset)
  })

  afterAll(async () => {
    if (e2eTestApp) {
      await e2eTestApp.stop()
    }
  }, TestConstants.AFTER_ALL_TIMEOUT)

  afterEach(async () => {
    await E2eUtils.purgeOrRecreate(internalAssetRepository)
    await E2eUtils.purgeOrRecreate(internalDistributionRepository)
  }, TestConstants.AFTER_EACH_TIMEOUT)

  describe("Success cases", () => {
    it.skip("should execute immediate payout successfully", async () => {
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const distribution = DistributionUtils.newInstance({
        asset: asset,
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: amount,
          amountType: AmountType.FIXED,
          snapshotId: SnapshotId.create("some-snapshot-id"),
        },
      })
      await internalDistributionRepository.save(distribution)

      const payload: CreatePayoutRequest = {
        subtype: PayoutSubtype.IMMEDIATE,
        amount,
        amountType: AmountType.FIXED,
        concept: "Test payout",
      }

      const response = await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(payload)
        .expect(HttpStatus.CREATED)

      expect(response.body).toBeDefined()
    })

    it.skip("should execute one-off payout successfully", async () => {
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const executeAt = faker.date.future()
      const distribution = DistributionUtils.newInstance({
        asset: asset,
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.ONE_OFF,
          amount: amount,
          amountType: AmountType.FIXED,
          executeAt: executeAt,
        },
      })
      await internalDistributionRepository.save(distribution)

      const payload: CreatePayoutRequest = {
        subtype: PayoutSubtype.ONE_OFF,
        amount,
        executeAt: executeAt.toISOString(),
        amountType: AmountType.FIXED,
        concept: "Test one-off payout",
      }

      const response = await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(payload)
        .expect(HttpStatus.CREATED)

      expect(response.body).toBeDefined()
    })
  })

  describe("Validation errors", () => {
    it("should return 400 when subtype is missing", async () => {
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const requestBody = {
        amount,
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(400)
    })

    it("should return 400 when subtype is invalid", async () => {
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const requestBody = {
        subtype: "INVALID_SUBTYPE",
        amount,
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(400)
    })

    it("should return 400 when amount is missing", async () => {
      const requestBody = {
        subtype: PayoutSubtype.IMMEDIATE,
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(400)
    })

    it("should return 400 when amount is not a positive number", async () => {
      const invalidAmounts = ["0", "-100", "abc", ""]

      for (const amount of invalidAmounts) {
        const requestBody = {
          subtype: PayoutSubtype.IMMEDIATE,
          amount,
        }

        await request(e2eTestApp.app.getHttpServer())
          .post(`/assets/${asset.id}/distributions/payout`)
          .send(requestBody)
          .expect(400)
      }
    })

    it("should return 400 when executeAt is missing for one-off payout", async () => {
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const requestBody = {
        subtype: PayoutSubtype.ONE_OFF,
        amount,
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(400)
    })

    it("should return 400 when executeAt is not a valid date string", async () => {
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const requestBody = {
        subtype: PayoutSubtype.ONE_OFF,
        amount,
        executeAt: "invalid-date",
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(400)
    })

    it("should return 400 when executeAt is in the past", async () => {
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const pastDate = faker.date.past().toISOString()
      const requestBody = {
        subtype: PayoutSubtype.ONE_OFF,
        amount,
        executeAt: pastDate,
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(400)
    })

    it.skip("should not require executeAt for immediate payout", async () => {
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const requestBody = {
        subtype: PayoutSubtype.IMMEDIATE,
        amount,
        executeAt: faker.date.future().toISOString(),
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(201)
    })
  })

  describe("Business logic errors", () => {
    it("should return 404 when asset does not exist", async () => {
      const nonExistentAssetId = faker.string.uuid()
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const requestBody = {
        subtype: PayoutSubtype.IMMEDIATE,
        amount,
        amountType: AmountType.FIXED,
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${nonExistentAssetId}/distributions/payout`)
        .send(requestBody)
        .expect(404)
    })
  })

  describe.skip("Edge cases", () => {
    it("should handle very large amounts", async () => {
      const largeAmount = "999999999999999999"
      const requestBody = {
        subtype: PayoutSubtype.IMMEDIATE,
        amount: largeAmount,
        amountType: AmountType.FIXED,
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(201)
    })

    it("should handle decimal amounts", async () => {
      const decimalAmount = "123.456789"
      const requestBody = {
        subtype: PayoutSubtype.IMMEDIATE,
        amount: decimalAmount,
        amountType: AmountType.FIXED,
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(201)
    })

    it("should handle executeAt at the boundary of future date validation", async () => {
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const nearFutureDate = new Date(Date.now() + 10 * 1000).toISOString()
      const requestBody = {
        subtype: PayoutSubtype.ONE_OFF,
        amount,
        executeAt: nearFutureDate,
      }

      await request(e2eTestApp.app.getHttpServer())
        .post(`/assets/${asset.id}/distributions/payout`)
        .send(requestBody)
        .expect(201)
    })
  })
})
