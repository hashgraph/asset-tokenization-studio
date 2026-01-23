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
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { BatchPayoutPersistence } from "@infrastructure/adapters/repositories/model/batch-payout.persistence"
import { HolderPersistence } from "@infrastructure/adapters/repositories/model/holder.persistence"
import { HolderUtils } from "@test/shared/holder.utils"
import { BatchPayoutStatus } from "@domain/model/batch-payout"
import { HolderStatus } from "@domain/model/holder"

describe("PATCH /distributions/:distributionId/retry", () => {
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
  }, TestConstants.AFTER_EACH_TIMEOUT)

  it(
    "should retry distribution failed holders successfully",
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
          amountType: AmountType.FIXED,
        },
        status: DistributionStatus.FAILED,
      })
      await internalDistributionRepository.save(DistributionPersistence.fromDistribution(distribution))
      const batchPayout = BatchPayoutUtils.newInstance({ distribution, status: BatchPayoutStatus.FAILED })
      await internalBatchPayoutRepository.save(BatchPayoutPersistence.fromBatchPayout(batchPayout))
      const holder = HolderUtils.newInstance({ batchPayout, status: HolderStatus.FAILED })
      await internalHolderRepository.save(HolderPersistence.fromHolder(holder))

      const executeDistributionResponse = {
        failed: [],
        succeeded: [holder.holderEvmAddress],
        paidAmount: [(distribution.details as any).amount],
        transactionId: "0.0.456@1234567891.987654321",
      } as any
      e2eTestApp.lifeCycleCashFlowMock.executeAmountSnapshotByAddresses.mockResolvedValue(executeDistributionResponse)

      const endpoint = `${baseEndpoint}/${distribution.id}/retry`

      await request(e2eTestApp.app.getHttpServer()).patch(endpoint).expect(HttpStatus.OK)

      const updatedDistribution = await internalDistributionRepository.findOneBy({ id: distribution.id })
      expect(updatedDistribution.status).toBe(DistributionStatus.COMPLETED)
      const updatedbatchPayout = await internalBatchPayoutRepository.findOneBy({ id: batchPayout.id })
      expect(updatedbatchPayout.status).toBe(BatchPayoutStatus.COMPLETED)
      const updatedHolder = await internalHolderRepository.findOneBy({ id: holder.id })
      expect(updatedHolder.status).toBe(HolderStatus.SUCCESS)
    },
    TestConstants.TEST_TIMEOUT,
  )
})
