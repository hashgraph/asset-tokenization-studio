// SPDX-License-Identifier: Apache-2.0

import { AmountType, DistributionType, PayoutSubtype, Recurrency } from "@domain/model/distribution"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { HederaService } from "@domain/ports/hedera.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { OnChainDistributionRepositoryPort } from "@domain/ports/on-chain-distribution-repository.port"
import { CreateHoldersDomainService } from "@domain/services/create-holders.domain-service"
import { ExecutePayoutDistributionDomainService } from "@domain/services/execute-payout-distribution.domain-service"
import { UpdateBatchPayoutStatusDomainService } from "@domain/services/update-batch-payout-status.domain-service"
import { UpdateDistributionStatusDomainService } from "@domain/services/update-distribution-status.domain-service"
import { ValidateAssetPauseStateDomainService } from "@domain/services/validate-asset-pause-state.domain-service"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { DistributionNotPayoutError } from "@domain/errors/distribution.error"
import { AssetPausedError } from "@domain/errors/asset.error"

describe(ExecutePayoutDistributionDomainService.name, () => {
  let executePayoutDistributionDomainService: ExecutePayoutDistributionDomainService
  const batchPayoutRepositoryMock = createMock<BatchPayoutRepository>()
  const assetTokenizationStudioServiceMock = createMock<AssetTokenizationStudioService>()
  const createHoldersDomainServiceMock = createMock<CreateHoldersDomainService>()
  const updateBatchPayoutStatusDomainServiceMock = createMock<UpdateBatchPayoutStatusDomainService>()
  const updateDistributionStatusDomainServiceMock = createMock<UpdateDistributionStatusDomainService>()
  const onchainDistributionRepositoryMock = createMock<OnChainDistributionRepositoryPort>()
  const distributionRepositoryMock = createMock<DistributionRepository>()
  const onChainLifeCycleCashFlowServiceMock = createMock<LifeCycleCashFlowPort>()
  const validateAssetPauseStateDomainServiceMock = createMock<ValidateAssetPauseStateDomainService>()
  const configMock = createMock<ConfigService>()
  const hederaServiceMock = createMock<HederaService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutePayoutDistributionDomainService,
        {
          provide: "BatchPayoutRepository",
          useValue: batchPayoutRepositoryMock,
        },
        {
          provide: "AssetTokenizationStudioService",
          useValue: assetTokenizationStudioServiceMock,
        },
        {
          provide: CreateHoldersDomainService,
          useValue: createHoldersDomainServiceMock,
        },
        {
          provide: "UpdateBatchPayoutStatusDomainService",
          useValue: updateBatchPayoutStatusDomainServiceMock,
        },
        {
          provide: "UpdateDistributionStatusDomainService",
          useValue: updateDistributionStatusDomainServiceMock,
        },
        {
          provide: "OnChainDistributionRepositoryPort",
          useValue: onchainDistributionRepositoryMock,
        },
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
        {
          provide: "OnChainLifeCycleCashFlowService",
          useValue: onChainLifeCycleCashFlowServiceMock,
        },
        {
          provide: ValidateAssetPauseStateDomainService,
          useValue: validateAssetPauseStateDomainServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configMock,
        },
        {
          provide: "HederaService",
          useValue: hederaServiceMock,
        },
      ],
    }).compile()

    executePayoutDistributionDomainService = module.get<ExecutePayoutDistributionDomainService>(
      ExecutePayoutDistributionDomainService,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should throw error if distribution is not a payout distribution", async () => {
      const corporateActionId = CorporateActionId.create(faker.string.numeric())
      const executionDate = faker.date.future()
      const distribution = DistributionUtils.newInstance({
        details: { type: DistributionType.CORPORATE_ACTION, corporateActionId, executionDate },
      })

      await expect(executePayoutDistributionDomainService.execute(distribution)).rejects.toThrow(
        DistributionNotPayoutError,
      )
    })

    it("should throw error if asset is paused", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })

      const pausedError = new AssetPausedError(distribution.asset.id, distribution.id)
      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockRejectedValue(pausedError)

      await expect(executePayoutDistributionDomainService.execute(distribution)).rejects.toThrow(AssetPausedError)
      expect(validateAssetPauseStateDomainServiceMock.validateDomainPauseState).toHaveBeenCalledWith(
        distribution.asset,
        distribution.id,
      )
    })

    it("should validate asset pause state before proceeding with payout", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])
      onchainDistributionRepositoryMock.getHoldersCountForSnapshotId.mockResolvedValue(150)
      batchPayoutRepositoryMock.saveBatchPayout.mockResolvedValue(undefined)
      assetTokenizationStudioServiceMock.takeSnapshot.mockResolvedValueOnce(Number(snapshotId.value))
      distributionRepositoryMock.updateDistribution.mockResolvedValue(distribution)
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      updateDistributionStatusDomainServiceMock.setDistributionStatusToInProgress.mockReturnValue(distribution)
      configMock.get.mockReturnValueOnce(100)

      await executePayoutDistributionDomainService.execute(distribution)

      expect(validateAssetPauseStateDomainServiceMock.validateDomainPauseState).toHaveBeenCalledWith(
        distribution.asset,
        distribution.id,
      )
      expect(batchPayoutRepositoryMock.saveBatchPayout).toHaveBeenCalled()
    })

    it("should call createBatchPayouts and processBatchPayouts for manual distribution", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])
      onchainDistributionRepositoryMock.getHoldersCountForSnapshotId.mockResolvedValue(150)
      batchPayoutRepositoryMock.saveBatchPayout.mockResolvedValue(undefined)
      assetTokenizationStudioServiceMock.takeSnapshot.mockResolvedValueOnce(Number(snapshotId.value))
      distributionRepositoryMock.updateDistribution.mockResolvedValue(distribution)
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      updateDistributionStatusDomainServiceMock.setDistributionStatusToInProgress.mockReturnValue(distribution)
      configMock.get.mockReturnValueOnce(100)

      await executePayoutDistributionDomainService.execute(distribution)

      expect(batchPayoutRepositoryMock.saveBatchPayout).toHaveBeenCalled()
    })

    it("should create next recurring distribution for recurring payout", async () => {
      jest.useFakeTimers()

      const executeAt = faker.date.future()
      const snapshotId = SnapshotId.create(faker.string.numeric())

      jest.setSystemTime(new Date(executeAt.getTime() - 24 * 60 * 60 * 1000))

      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.RECURRING,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
          executeAt,
          recurrency: Recurrency.MONTHLY,
        },
      })

      jest.setSystemTime(new Date(executeAt.getTime() + 24 * 60 * 60 * 1000))

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])
      onchainDistributionRepositoryMock.getHoldersCountForSnapshotId.mockResolvedValue(150)
      batchPayoutRepositoryMock.saveBatchPayout.mockResolvedValue(undefined)
      assetTokenizationStudioServiceMock.takeSnapshot.mockResolvedValueOnce(Number(snapshotId.value))
      distributionRepositoryMock.updateDistribution.mockResolvedValue(distribution)
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      updateDistributionStatusDomainServiceMock.setDistributionStatusToInProgress.mockReturnValue(distribution)
      configMock.get.mockReturnValueOnce(100)

      await executePayoutDistributionDomainService.execute(distribution)

      expect(distributionRepositoryMock.saveDistribution).toHaveBeenCalled()
      expect(batchPayoutRepositoryMock.saveBatchPayout).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it("should throw error if batch payouts already exist for distribution", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })

      const existingBatchPayout = {} as any
      assetTokenizationStudioServiceMock.takeSnapshot.mockResolvedValueOnce(Number(snapshotId.value))
      distributionRepositoryMock.updateDistribution.mockResolvedValue(distribution)
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      updateDistributionStatusDomainServiceMock.setDistributionStatusToInProgress.mockReturnValue(distribution)
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([existingBatchPayout])

      await expect(executePayoutDistributionDomainService.execute(distribution)).rejects.toThrow(
        `BatchPayouts already exist for distribution ${distribution.id}`,
      )
    })
  })

  describe("getHoldersCount", () => {
    it("should return holders count for manual distribution", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      const expectedCount = 150
      onchainDistributionRepositoryMock.getHoldersCountForSnapshotId.mockResolvedValue(expectedCount)

      const result = await (executePayoutDistributionDomainService as any).getHoldersCount(distribution)

      expect(result).toBe(expectedCount)
    })

    it("should throw error if no holders found", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      onchainDistributionRepositoryMock.getHoldersCountForSnapshotId.mockResolvedValue(0)

      await expect((executePayoutDistributionDomainService as any).getHoldersCount(distribution)).rejects.toThrow(
        `No holders found for distribution ${distribution.id}`,
      )
    })

    it("should throw error for non-manual distribution", async () => {
      const corporateActionId = CorporateActionId.create(faker.string.numeric())
      const executionDate = faker.date.future()
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId,
          executionDate,
        },
      })

      await expect((executePayoutDistributionDomainService as any).getHoldersCount(distribution)).rejects.toThrow(
        DistributionNotPayoutError,
      )
    })
  })

  describe("executeHederaCall", () => {
    it("should call LifeCycleSDK executeAmountSnapshot method with correct parameters", async () => {
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.IMMEDIATE,
          snapshotId: SnapshotId.create(faker.string.alpha()),
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      const mockBatchPayout = {
        distribution,
        holdersNumber: 50,
      } as any
      const pageIndex = 1
      const expectedResponse = { failed: faker.string.alphanumeric({ length: 10 }) } as any
      onChainLifeCycleCashFlowServiceMock.executeAmountSnapshot.mockResolvedValue(expectedResponse)

      const result = await (executePayoutDistributionDomainService as any).executeHederaCall(mockBatchPayout, pageIndex)

      if (distribution.details.type === DistributionType.PAYOUT) {
        expect(onChainLifeCycleCashFlowServiceMock.executeAmountSnapshot).toHaveBeenCalledWith(
          distribution.asset.lifeCycleCashFlowHederaAddress,
          distribution.asset.hederaTokenAddress,
          Number(distribution.details.snapshotId.value),
          pageIndex,
          mockBatchPayout.holdersNumber,
          distribution.details.amount,
        )
      }
      expect(result).toBe(expectedResponse)
    })

    it("should call LifeCycleSDK executePercentageSnapshot method with correct parameters", async () => {
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.IMMEDIATE,
          snapshotId: SnapshotId.create(faker.string.alpha()),
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.PERCENTAGE,
        },
      })
      const mockBatchPayout = {
        distribution,
        holdersNumber: 50,
      } as any
      const pageIndex = 1
      const expectedResponse = { failed: faker.string.alphanumeric({ length: 10 }) } as any
      onChainLifeCycleCashFlowServiceMock.executePercentageSnapshot.mockResolvedValue(expectedResponse)

      const result = await (executePayoutDistributionDomainService as any).executeHederaCall(mockBatchPayout, pageIndex)

      if (distribution.details.type === DistributionType.PAYOUT) {
        expect(onChainLifeCycleCashFlowServiceMock.executePercentageSnapshot).toHaveBeenCalledWith(
          distribution.asset.lifeCycleCashFlowHederaAddress,
          distribution.asset.hederaTokenAddress,
          Number(distribution.details.snapshotId.value),
          pageIndex,
          mockBatchPayout.holdersNumber,
          distribution.details.amount,
        )
        expect(result).toBe(expectedResponse)
      }
    })

    it("should throw error for non-manual distribution", async () => {
      const corporateActionId = CorporateActionId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: { type: DistributionType.CORPORATE_ACTION, corporateActionId, executionDate: faker.date.future() },
      })
      const mockBatchPayout = {
        distribution,
        holdersNumber: 50,
      } as any
      const pageIndex = 1

      await expect(
        (executePayoutDistributionDomainService as any).executeHederaCall(mockBatchPayout, pageIndex),
      ).rejects.toThrow(DistributionNotPayoutError)

      expect(onChainLifeCycleCashFlowServiceMock.executeDistribution).not.toHaveBeenCalled()
    })

    it("should propagate errors from onChainLifeCycleCashFlowService", async () => {
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.IMMEDIATE,
          snapshotId: SnapshotId.create(faker.string.alpha()),
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      const mockBatchPayout = {
        distribution,
        holdersNumber: 50,
      } as any
      const pageIndex = 1
      const error = new Error("LifeCycle service error")

      onChainLifeCycleCashFlowServiceMock.executeAmountSnapshot.mockRejectedValue(error)

      await expect(
        (executePayoutDistributionDomainService as any).executeHederaCall(mockBatchPayout, pageIndex),
      ).rejects.toThrow("LifeCycle service error")
    })
  })

  describe("error handling", () => {
    it("should propagate errors from onchain repository", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })

      const error = new Error("Blockchain error")
      assetTokenizationStudioServiceMock.takeSnapshot.mockResolvedValueOnce(Number(snapshotId.value))
      distributionRepositoryMock.updateDistribution.mockResolvedValue(distribution)
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      updateDistributionStatusDomainServiceMock.setDistributionStatusToInProgress.mockReturnValue(distribution)
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])
      onchainDistributionRepositoryMock.getHoldersCountForSnapshotId.mockRejectedValue(error)

      await expect(executePayoutDistributionDomainService.execute(distribution)).rejects.toThrow("Blockchain error")
    })

    it("should propagate errors from batch payout repository", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })

      const error = new Error("Database error")
      assetTokenizationStudioServiceMock.takeSnapshot.mockResolvedValueOnce(Number(snapshotId.value))
      distributionRepositoryMock.updateDistribution.mockResolvedValue(distribution)
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      updateDistributionStatusDomainServiceMock.setDistributionStatusToInProgress.mockReturnValue(distribution)
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockRejectedValue(error)

      await expect(executePayoutDistributionDomainService.execute(distribution)).rejects.toThrow("Database error")
    })
  })
})
