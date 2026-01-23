// SPDX-License-Identifier: Apache-2.0

import { Repository } from "typeorm"
import { E2eTestApp } from "@test/e2e/shared/e2e-test.app"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { BatchPayoutPersistence } from "@infrastructure/adapters/repositories/model/batch-payout.persistence"
import { MassPayoutCronService } from "@infrastructure/cron/mass-payout-cron.service"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { AssetUtils } from "@test/shared/asset.utils"
import {
  Distribution,
  DistributionStatus,
  DistributionType,
  PayoutSubtype,
  Recurrency,
} from "@domain/model/distribution"
import { E2eUtils } from "@test/e2e/shared/e2e-utils"
import { TestConstants } from "@test/e2e/shared/test-constants"
import { Asset } from "@domain/model/asset"

import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { faker } from "@faker-js/faker/."
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { fakeHederaAddress } from "@test/shared/utils"

describe("Scheduled Payouts Cron", () => {
  let e2eTestApp: E2eTestApp
  let internalDistributionRepository: Repository<DistributionPersistence>
  let internalAssetRepository: Repository<AssetPersistence>
  let internalBatchPayoutRepository: Repository<BatchPayoutPersistence>
  let massPayoutCronService: MassPayoutCronService

  beforeAll(async () => {
    e2eTestApp = await E2eTestApp.create()
    internalDistributionRepository = e2eTestApp.getRepository(DistributionPersistence)
    internalAssetRepository = e2eTestApp.getRepository(AssetPersistence)
    internalBatchPayoutRepository = e2eTestApp.getRepository(BatchPayoutPersistence)
    massPayoutCronService = e2eTestApp.app.get<MassPayoutCronService>(MassPayoutCronService)
  }, TestConstants.BEFORE_ALL_TIMEOUT)

  afterAll(async () => {
    await e2eTestApp.stop()
  }, TestConstants.AFTER_ALL_TIMEOUT)

  afterEach(async () => {
    e2eTestApp.onChainDistributionMock.clearMockData()
    await E2eUtils.purgeOrRecreate(internalDistributionRepository)
    await E2eUtils.purgeOrRecreate(internalBatchPayoutRepository)
  }, TestConstants.AFTER_EACH_TIMEOUT)

  it(
    "should process scheduled distributions for today when cron is triggered",
    async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const tomorrow = E2eUtils.getTomorrow()
      const distributionTodayScheduled1 = await generateDistribution(pastDate)
      const distributionTodayScheduled2 = await generateDistribution(
        pastDate,
        DistributionStatus.SCHEDULED,
        DistributionType.PAYOUT,
      )
      const distributionTomorrowScheduled = await generateDistribution(tomorrow)
      const distributionTodayInProgress = await generateDistribution(pastDate, DistributionStatus.IN_PROGRESS)
      const distributionTodayCompleted = await generateDistribution(pastDate, DistributionStatus.COMPLETED)
      const executeDistributionResponseCorporateAction = {
        failed: [],
        succeeded: ["0x9876543210987654321098765432109876543210"],
        paidAmount: ["1000.90"],
        transactionId: "0.0.123@1234567890.123456789",
      } as any
      const executeDistributionResponsePayout = {
        failed: ["0x1234567890123456789012345678901234567890"],
        succeeded: [],
        paidAmount: [],
        transactionId: "0.0.456@1234567891.987654321",
      } as any

      e2eTestApp.assetTokenizationStudioServiceMock.takeSnapshot.mockResolvedValueOnce(Number(snapshotId.value))
      e2eTestApp.hederaServiceMock.getHederaAddressFromEvm.mockImplementation((evmAddress: string) => {
        if (evmAddress === "0x1234567890123456789012345678901234567890") {
          return Promise.resolve("0.0.1001")
        } else if (evmAddress === "0x9876543210987654321098765432109876543210") {
          return Promise.resolve("0.0.1002")
        } else {
          return Promise.resolve(fakeHederaAddress())
        }
      })
      e2eTestApp.hederaServiceMock.getParentHederaTransactionHash.mockResolvedValue({
        hederaTransactionHash:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        isFromMirrorNode: true,
      })
      e2eTestApp.lifeCycleCashFlowMock.executeDistribution.mockResolvedValue(executeDistributionResponseCorporateAction)
      e2eTestApp.lifeCycleCashFlowMock.executeAmountSnapshot.mockResolvedValue(executeDistributionResponsePayout)

      await massPayoutCronService.handleScheduledPayouts()

      expect(e2eTestApp.lifeCycleCashFlowMock.executeDistribution).toHaveBeenCalled()
      expect(e2eTestApp.lifeCycleCashFlowMock.executeAmountSnapshot).toHaveBeenCalled()

      const distributionsAfterCron = await internalDistributionRepository.find()
      const processedDistribution1 = distributionsAfterCron.find((d) => d.id === distributionTodayScheduled1.id)
      const processedDistribution2 = distributionsAfterCron.find((d) => d.id === distributionTodayScheduled2.id)
      const unprocessedTomorrow = distributionsAfterCron.find((d) => d.id === distributionTomorrowScheduled.id)
      const unprocessedInProgress = distributionsAfterCron.find((d) => d.id === distributionTodayInProgress.id)
      const unprocessedCompleted = distributionsAfterCron.find((d) => d.id === distributionTodayCompleted.id)
      const nextRecurring = distributionsAfterCron.find(
        (d) => d.type === DistributionType.PAYOUT && d.id !== distributionTodayScheduled2.id,
      )
      expect(processedDistribution1).toBeDefined()
      expect(processedDistribution2).toBeDefined()
      expect(processedDistribution1.status).toBe(DistributionStatus.COMPLETED)
      expect(processedDistribution2.status).toBe(DistributionStatus.FAILED)
      expect(processedDistribution2.snapshotId).toBe(snapshotId.value)
      expect(unprocessedTomorrow?.status).toBe(DistributionStatus.SCHEDULED)
      expect(unprocessedInProgress?.status).toBe(DistributionStatus.IN_PROGRESS)
      expect(unprocessedCompleted?.status).toBe(DistributionStatus.COMPLETED)
      expect(nextRecurring).toBeDefined()
      expect(nextRecurring.status).toBe(DistributionStatus.SCHEDULED)
      expect(nextRecurring.executionDate).toBeDefined()
      expect(nextRecurring.type).toBe(DistributionType.PAYOUT)
      expect(nextRecurring.subtype).toBe(PayoutSubtype.RECURRING)
      expect(nextRecurring.amount).toBe(distributionTodayScheduled2.amount)
      expect(nextRecurring.amountType).toBe(distributionTodayScheduled2.amountType)
      expect(nextRecurring.recurrency).toBe(distributionTodayScheduled2.recurrency)
      expect(distributionsAfterCron).toHaveLength(6)
    },
    TestConstants.TEST_TIMEOUT,
  )

  it(
    "should handle empty distributions list when cron is triggered",
    async () => {
      await massPayoutCronService.handleScheduledPayouts()

      const distributions = await internalDistributionRepository.find()
      expect(distributions).toHaveLength(0)
    },
    TestConstants.TEST_TIMEOUT,
  )

  it(
    "should process new distributions",
    async () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const asset = await generateAndSaveAsset()

      await saveDistributionInMockedAts(asset, "corporateActionIdFuture", futureDate)

      const pastDistribution = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create("corporateActionIdToday"),
          executionDate: pastDate,
        },
        status: DistributionStatus.SCHEDULED,
      })
      await internalDistributionRepository.save(DistributionPersistence.fromDistribution(pastDistribution))

      await massPayoutCronService.handleScheduledPayouts()

      const distributionsAfterCron = await internalDistributionRepository.find()
      const pastDistributionAfter = distributionsAfterCron.find((d) => d.corporateActionID === "corporateActionIdToday")
      const futureDistribution = distributionsAfterCron.find((d) => d.corporateActionID === "corporateActionIdFuture")
      expect(pastDistributionAfter).toBeDefined()
      expect(futureDistribution).toBeDefined()
      expect(pastDistributionAfter?.status).toBe(DistributionStatus.COMPLETED)
      expect(futureDistribution?.status).toBe(DistributionStatus.SCHEDULED)
      expect(distributionsAfterCron).toHaveLength(2)
    },
    TestConstants.TEST_TIMEOUT,
  )

  async function generateDistribution(
    date: Date,
    status: DistributionStatus = DistributionStatus.SCHEDULED,
    type: DistributionType = DistributionType.CORPORATE_ACTION,
    payoutSubtype: PayoutSubtype = PayoutSubtype.RECURRING,
  ): Promise<DistributionPersistence> {
    const asset = await generateAndSaveAsset()
    const distribution = await generateAndSaveDistribution(asset, date, status, type, payoutSubtype)
    if (distribution.details.type === DistributionType.CORPORATE_ACTION) {
      await saveDistributionInMockedAts(asset, distribution.details.corporateActionId.value, date)
    }
    return DistributionPersistence.fromDistribution(distribution)
  }

  async function generateAndSaveAsset(): Promise<Asset> {
    const asset = AssetUtils.newInstance()
    let assetPersistence = AssetPersistence.fromAsset(asset)
    assetPersistence = await internalAssetRepository.save(assetPersistence)
    return assetPersistence.toAsset()
  }

  async function generateAndSaveDistribution(
    asset: Asset,
    date: Date,
    status: DistributionStatus,
    type: DistributionType,
    payoutSubtype: PayoutSubtype,
  ): Promise<Distribution> {
    const distribution = DistributionUtils.newInstance({
      asset,
      details: {
        type,
        subtype: payoutSubtype,
        corporateActionId:
          type === DistributionType.CORPORATE_ACTION
            ? CorporateActionId.create(faker.string.alpha({ length: 10 }))
            : undefined,
        executionDate: type === DistributionType.CORPORATE_ACTION ? date : undefined,
        executeAt: type === DistributionType.PAYOUT ? date : undefined,
        amount: type === DistributionType.PAYOUT ? faker.number.int({ min: 1, max: 1000 }).toString() : undefined,
        recurrency: payoutSubtype === PayoutSubtype.RECURRING ? Recurrency.WEEKLY : undefined,
      } as any,
      status: status,
    })

    const distributionPersistence = await internalDistributionRepository.save(
      DistributionPersistence.fromDistribution(distribution),
    )
    return distributionPersistence.toDistribution()
  }

  async function saveDistributionInMockedAts(asset: Asset, corporateActionID: string, date: Date): Promise<void> {
    e2eTestApp.onChainDistributionMock.addMockDistributionForAsset(asset, corporateActionID, date)
  }
})
