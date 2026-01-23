// SPDX-License-Identifier: Apache-2.0

import { ProcessScheduledPayoutsUseCase } from "@application/use-cases/process-scheduled-payouts.use-case"
import { AmountType, DistributionStatus, DistributionType, PayoutSubtype } from "@domain/model/distribution"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { ExecuteCorporateActionDistributionDomainService } from "@domain/services/execute-corporate-action-distribution.domain-service"
import { ExecutePayoutDistributionDomainService } from "@domain/services/execute-payout-distribution.domain-service"
import { SyncFromOnChainDomainService } from "@domain/services/sync-from-onchain.domain-service"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"
import { DistributionUtils } from "@test/shared/distribution.utils"

describe(ProcessScheduledPayoutsUseCase.name, () => {
  let processScheduledPayoutsUseCase: ProcessScheduledPayoutsUseCase
  const distributionRepositoryMock = createMock<DistributionRepository>()
  const syncFromOnChainDomainServiceMock = createMock<SyncFromOnChainDomainService>()
  const executeCorporateActionDistributionDomainServiceMock =
    createMock<ExecuteCorporateActionDistributionDomainService>()
  const executePayoutDistributionDomainServiceMock = createMock<ExecutePayoutDistributionDomainService>()
  const configServiceMock = createMock<ConfigService>()
  const DEFAULT_BATCH_SIZE = 100

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessScheduledPayoutsUseCase,
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
        {
          provide: SyncFromOnChainDomainService,
          useValue: syncFromOnChainDomainServiceMock,
        },
        {
          provide: ExecuteCorporateActionDistributionDomainService,
          useValue: executeCorporateActionDistributionDomainServiceMock,
        },
        {
          provide: ExecutePayoutDistributionDomainService,
          useValue: executePayoutDistributionDomainServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile()

    processScheduledPayoutsUseCase = module.get<ProcessScheduledPayoutsUseCase>(ProcessScheduledPayoutsUseCase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should sync from on-chain, find scheduled distributions for today and process them", async () => {
      const distribution1 = DistributionUtils.newInstance({ status: DistributionStatus.SCHEDULED })
      const distribution2 = DistributionUtils.newInstance({ status: DistributionStatus.SCHEDULED })
      const scheduledDistributions = [distribution1, distribution2]
      distributionRepositoryMock.findByExecutionDateRange.mockResolvedValue(scheduledDistributions)
      configServiceMock.get.mockReturnValueOnce(DEFAULT_BATCH_SIZE)

      await processScheduledPayoutsUseCase.execute()

      expect(syncFromOnChainDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(distributionRepositoryMock.findByExecutionDateRange).toHaveBeenCalledTimes(1)
      expect(executeCorporateActionDistributionDomainServiceMock.execute).toHaveBeenCalledTimes(2)
      expect(executeCorporateActionDistributionDomainServiceMock.execute).toHaveBeenCalledWith(distribution1)
      expect(executeCorporateActionDistributionDomainServiceMock.execute).toHaveBeenCalledWith(distribution2)
    })

    it("should sync from on-chain and handle empty distributions list", async () => {
      distributionRepositoryMock.findByExecutionDateRange.mockResolvedValue([])
      configServiceMock.get.mockReturnValue(DEFAULT_BATCH_SIZE)

      await processScheduledPayoutsUseCase.execute()

      expect(syncFromOnChainDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(distributionRepositoryMock.findByExecutionDateRange).toHaveBeenCalledTimes(1)
      expect(executeCorporateActionDistributionDomainServiceMock.execute).not.toHaveBeenCalled()
      expect(executePayoutDistributionDomainServiceMock.execute).not.toHaveBeenCalled()
    })

    it("should process single distribution when only one is scheduled for today", async () => {
      const distribution = DistributionUtils.newInstance({ status: DistributionStatus.SCHEDULED })
      const scheduledDistributions = [distribution]
      distributionRepositoryMock.findByExecutionDateRange.mockResolvedValue(scheduledDistributions)
      configServiceMock.get.mockReturnValue(DEFAULT_BATCH_SIZE)

      await processScheduledPayoutsUseCase.execute()

      expect(syncFromOnChainDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(distributionRepositoryMock.findByExecutionDateRange).toHaveBeenCalledTimes(1)
      expect(executeCorporateActionDistributionDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(executeCorporateActionDistributionDomainServiceMock.execute).toHaveBeenCalledWith(distribution)
    })

    it("should handle manual distributions correctly", async () => {
      const manualDistribution = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
        details: {
          type: DistributionType.PAYOUT,
          snapshotId: SnapshotId.create(faker.string.numeric()),
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      const scheduledDistributions = [manualDistribution]
      distributionRepositoryMock.findByExecutionDateRange.mockResolvedValue(scheduledDistributions)
      configServiceMock.get.mockReturnValue(DEFAULT_BATCH_SIZE)

      await processScheduledPayoutsUseCase.execute()

      expect(syncFromOnChainDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(distributionRepositoryMock.findByExecutionDateRange).toHaveBeenCalledTimes(1)
      expect(executePayoutDistributionDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(executePayoutDistributionDomainServiceMock.execute).toHaveBeenCalledWith(manualDistribution)
      expect(executeCorporateActionDistributionDomainServiceMock.execute).not.toHaveBeenCalled()
    })

    it("should handle mixed distribution types correctly", async () => {
      const corporateActionDistribution = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.numeric()),
          executionDate: faker.date.future(),
        },
      })
      const manualDistribution = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
        details: {
          type: DistributionType.PAYOUT,
          snapshotId: SnapshotId.create(faker.string.numeric()),
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      const scheduledDistributions = [corporateActionDistribution, manualDistribution]
      distributionRepositoryMock.findByExecutionDateRange.mockResolvedValue(scheduledDistributions)
      configServiceMock.get.mockReturnValue(DEFAULT_BATCH_SIZE)

      await processScheduledPayoutsUseCase.execute()

      expect(syncFromOnChainDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(distributionRepositoryMock.findByExecutionDateRange).toHaveBeenCalledTimes(1)
      expect(executeCorporateActionDistributionDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(executeCorporateActionDistributionDomainServiceMock.execute).toHaveBeenCalledWith(
        corporateActionDistribution,
      )
      expect(executePayoutDistributionDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(executePayoutDistributionDomainServiceMock.execute).toHaveBeenCalledWith(manualDistribution)
    })

    it("should propagate errors from sync service", async () => {
      const error = new Error("Sync failed")
      syncFromOnChainDomainServiceMock.execute.mockRejectedValueOnce(error)

      await expect(processScheduledPayoutsUseCase.execute()).rejects.toThrow("Sync failed")

      expect(syncFromOnChainDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(distributionRepositoryMock.findByExecutionDateRange).not.toHaveBeenCalled()
    })

    it("should propagate errors from distribution repository", async () => {
      const error = new Error("Database error")
      distributionRepositoryMock.findByExecutionDateRange.mockRejectedValueOnce(error)

      await expect(processScheduledPayoutsUseCase.execute()).rejects.toThrow("Database error")

      expect(syncFromOnChainDomainServiceMock.execute).toHaveBeenCalledTimes(1)
      expect(distributionRepositoryMock.findByExecutionDateRange).toHaveBeenCalledTimes(1)
    })

    it("should propagate errors from mass payout execution", async () => {
      const distribution = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.numeric()),
          executionDate: faker.date.future(),
        },
      })
      const error = new Error("Mass payout failed")
      distributionRepositoryMock.findByExecutionDateRange.mockResolvedValue([distribution])
      configServiceMock.get.mockReturnValue(DEFAULT_BATCH_SIZE)
      executeCorporateActionDistributionDomainServiceMock.execute.mockRejectedValueOnce(error)

      await expect(processScheduledPayoutsUseCase.execute()).rejects.toThrow("Mass payout failed")

      expect(executeCorporateActionDistributionDomainServiceMock.execute).toHaveBeenCalledTimes(1)
    })

    it("should propagate errors from manual payout execution", async () => {
      const distribution = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
        details: {
          type: DistributionType.PAYOUT,
          snapshotId: SnapshotId.create(faker.string.numeric()),
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      const error = new Error("Payout failed")
      distributionRepositoryMock.findByExecutionDateRange.mockResolvedValue([distribution])
      configServiceMock.get.mockReturnValue(DEFAULT_BATCH_SIZE)
      executePayoutDistributionDomainServiceMock.execute.mockRejectedValueOnce(error)

      await expect(processScheduledPayoutsUseCase.execute()).rejects.toThrow("Payout failed")

      expect(executePayoutDistributionDomainServiceMock.execute).toHaveBeenCalledTimes(1)
    })
  })
})
