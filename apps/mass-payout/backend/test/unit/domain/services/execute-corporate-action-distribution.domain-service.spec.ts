// SPDX-License-Identifier: Apache-2.0

import { AmountType, DistributionType, PayoutSubtype } from "@domain/model/distribution"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { HederaService } from "@domain/ports/hedera.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { OnChainDistributionRepositoryPort } from "@domain/ports/on-chain-distribution-repository.port"
import { CreateHoldersDomainService } from "@domain/services/create-holders.domain-service"
import { ExecuteCorporateActionDistributionDomainService } from "@domain/services/execute-corporate-action-distribution.domain-service"
import { UpdateBatchPayoutStatusDomainService } from "@domain/services/update-batch-payout-status.domain-service"
import { ValidateAssetPauseStateDomainService } from "@domain/services/validate-asset-pause-state.domain-service"
import { faker } from "@faker-js/faker/."
import { createMock } from "@golevelup/ts-jest"
import { ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { AssetUtils } from "@test/shared/asset.utils"
import { AssetPausedError } from "@domain/errors/asset.error"
import { DistributionNotCorporateActionError } from "@domain/errors/distribution.error"

describe(ExecuteCorporateActionDistributionDomainService.name, () => {
  let executeCorporateActionDistributionDomainService: ExecuteCorporateActionDistributionDomainService
  const assetRepositoryMock = createMock<AssetRepository>()
  const batchPayoutRepositoryMock = createMock<BatchPayoutRepository>()
  const assetTokenizationStudioServiceMock = createMock<AssetTokenizationStudioService>()
  const createHoldersDomainServiceMock = createMock<CreateHoldersDomainService>()
  const updateBatchPayoutStatusDomainServiceMock = createMock<UpdateBatchPayoutStatusDomainService>()
  const validateAssetPauseStateDomainServiceMock = createMock<ValidateAssetPauseStateDomainService>()
  const configServiceMock = createMock<ConfigService>()
  const hederaServiceMock = createMock<HederaService>()
  const onchainDistributionRepositoryMock = createMock<OnChainDistributionRepositoryPort>()
  const onChainLifeCycleCashFlowServiceMock = createMock<LifeCycleCashFlowPort>()
  const DEFAULT_BATCH_SIZE = 100

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteCorporateActionDistributionDomainService,
        {
          provide: "AssetRepository",
          useValue: assetRepositoryMock,
        },
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
          provide: ValidateAssetPauseStateDomainService,
          useValue: validateAssetPauseStateDomainServiceMock,
        },
        {
          provide: "OnChainDistributionRepositoryPort",
          useValue: onchainDistributionRepositoryMock,
        },
        {
          provide: "OnChainLifeCycleCashFlowService",
          useValue: onChainLifeCycleCashFlowServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: "HederaService",
          useValue: hederaServiceMock,
        },
      ],
    }).compile()
    configServiceMock.get.mockReturnValue(DEFAULT_BATCH_SIZE)
    executeCorporateActionDistributionDomainService = module.get<ExecuteCorporateActionDistributionDomainService>(
      ExecuteCorporateActionDistributionDomainService,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should throw error if distribution is not a corporate action", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.IMMEDIATE,
          snapshotId,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).rejects.toThrow(
        DistributionNotCorporateActionError,
      )
    })

    it("should call createBatchPayouts and processBatchPayouts for corporate action distribution", async () => {
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.past(),
        },
      })
      const expectedHoldersCount = 150
      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)
      configServiceMock.get.mockReturnValueOnce(100)
      onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId.mockResolvedValueOnce(expectedHoldersCount)
      createHoldersDomainServiceMock.execute.mockResolvedValue(undefined)
      updateBatchPayoutStatusDomainServiceMock.execute.mockResolvedValue(undefined)

      await executeCorporateActionDistributionDomainService.execute(distribution)

      expect(batchPayoutRepositoryMock.saveBatchPayout).toHaveBeenCalled()
    })

    it("should throw error if batch payouts already exist for distribution", async () => {
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.past(),
        },
      })
      const existingBatchPayout = {} as any

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([existingBatchPayout])

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).rejects.toThrow(
        `BatchPayouts already exist for distribution ${distribution.id}`,
      )
    })
  })

  describe("getHoldersCount", () => {
    it("should return holders count for corporate action distribution", async () => {
      const distribution = DistributionUtils.newInstance()
      const expectedCount = 150

      onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId.mockResolvedValue(expectedCount)

      const result = await (executeCorporateActionDistributionDomainService as any).getHoldersCount(distribution)

      expect(result).toBe(expectedCount)
    })

    it("should throw error if no holders found", async () => {
      const distribution = DistributionUtils.newInstance()

      onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId.mockResolvedValue(0)

      await expect(
        (executeCorporateActionDistributionDomainService as any).getHoldersCount(distribution),
      ).rejects.toThrow(`No holders found for distribution ${distribution.id}`)
    })

    it("should throw error for non-corporate action distribution", async () => {
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

      await expect(
        (executeCorporateActionDistributionDomainService as any).getHoldersCount(distribution),
      ).rejects.toThrow(DistributionNotCorporateActionError)
    })
  })

  describe("executeHederaCall", () => {
    it("should call LifeCycleSDK with correct parameters", async () => {
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.past(),
        },
      })
      const mockBatchPayout = {
        distribution,
        holdersNumber: 50,
      } as any
      const pageIndex = 1
      const expectedResponse = { failed: faker.string.alphanumeric({ length: 10 }) } as any
      onChainLifeCycleCashFlowServiceMock.executeDistribution.mockResolvedValue(expectedResponse)

      const result = await (executeCorporateActionDistributionDomainService as any).executeHederaCall(
        mockBatchPayout,
        pageIndex,
      )

      if (distribution.details.type === DistributionType.CORPORATE_ACTION) {
        expect(onChainLifeCycleCashFlowServiceMock.executeDistribution).toHaveBeenCalledWith(
          distribution.asset.lifeCycleCashFlowHederaAddress,
          distribution.asset.hederaTokenAddress,
          Number(distribution.details.corporateActionId.value),
          pageIndex,
          mockBatchPayout.holdersNumber,
        )
      }
      expect(result).toBe(expectedResponse)
    })

    it("should throw error for non-corporate action distribution", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.IMMEDIATE,
          snapshotId,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      const mockBatchPayout = {
        distribution,
        holdersNumber: 50,
      } as any
      const pageIndex = 1

      await expect(
        (executeCorporateActionDistributionDomainService as any).executeHederaCall(mockBatchPayout, pageIndex),
      ).rejects.toThrow(DistributionNotCorporateActionError)

      expect(onChainLifeCycleCashFlowServiceMock.executeDistribution).not.toHaveBeenCalled()
    })

    it("should propagate errors from onChainLifeCycleCashFlowService", async () => {
      const distribution = DistributionUtils.newInstance()
      const mockBatchPayout = {
        distribution,
        holdersNumber: 50,
      } as any
      const pageIndex = 1
      const error = new Error("LifeCycle service error")

      onChainLifeCycleCashFlowServiceMock.executeDistribution.mockRejectedValue(error)

      await expect(
        (executeCorporateActionDistributionDomainService as any).executeHederaCall(mockBatchPayout, pageIndex),
      ).rejects.toThrow("LifeCycle service error")
    })
  })

  describe("error handling", () => {
    it("should propagate errors from onchain repository", async () => {
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.past(),
        },
      })
      const error = new Error("Blockchain error")

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])
      onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId.mockRejectedValue(error)

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).rejects.toThrow(
        "Blockchain error",
      )
    })

    it("should propagate errors from batch payout repository", async () => {
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.past(),
        },
      })
      const error = new Error("Database error")

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockRejectedValue(error)

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).rejects.toThrow(
        "Database error",
      )
    })

    it("should skip execution when execution date has not been reached", async () => {
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])

      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.future(),
        },
      })

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).resolves.toBeUndefined()

      expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).not.toHaveBeenCalled()
    })

    it("should throw AssetPausedError when asset is paused according to smart contract", async () => {
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.past(),
        },
      })

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockRejectedValue(
        new AssetPausedError(distribution.asset.name, distribution.asset.hederaTokenAddress),
      )

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).rejects.toThrow(
        new AssetPausedError(distribution.asset.name, distribution.asset.hederaTokenAddress),
      )

      expect(validateAssetPauseStateDomainServiceMock.validateDomainPauseState).toHaveBeenCalledWith(
        distribution.asset,
        distribution.id,
      )
      expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).not.toHaveBeenCalled()
      expect(onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId).not.toHaveBeenCalled()
    })

    it("should execute when asset is not paused according to smart contract", async () => {
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])
      onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId.mockResolvedValue(10)
      onChainLifeCycleCashFlowServiceMock.executeDistribution.mockResolvedValue({} as any)

      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.past(),
        },
      })

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).resolves.toBeUndefined()

      expect(validateAssetPauseStateDomainServiceMock.validateDomainPauseState).toHaveBeenCalledWith(
        distribution.asset,
        distribution.id,
      )
      expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).toHaveBeenCalled()
      expect(onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId).toHaveBeenCalled()
    })

    it("should execute when execution date is today regardless of time", async () => {
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])
      onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId.mockResolvedValue(10)
      onChainLifeCycleCashFlowServiceMock.executeDistribution.mockResolvedValue({} as any)

      const todayWithFutureTime = new Date()
      todayWithFutureTime.setHours(23, 59, 59, 999)

      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: todayWithFutureTime,
        },
      })

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).resolves.toBeUndefined()

      expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).toHaveBeenCalled()
      expect(onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId).toHaveBeenCalled()
    })

    it("should sync asset pause state when DLT shows paused but backend shows unpaused", async () => {
      const unpausedAsset = AssetUtils.newInstance({ isPaused: false })
      const distribution = DistributionUtils.newInstance({
        asset: unpausedAsset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.past(),
        },
      })

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockRejectedValue(
        new AssetPausedError(distribution.asset.name, distribution.asset.hederaTokenAddress),
      )

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).rejects.toThrow(
        new AssetPausedError(distribution.asset.name, distribution.asset.hederaTokenAddress),
      )

      expect(validateAssetPauseStateDomainServiceMock.validateDomainPauseState).toHaveBeenCalledWith(
        distribution.asset,
        distribution.id,
      )
    })

    it("should sync asset pause state when DLT shows unpaused but backend shows paused", async () => {
      batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])
      onchainDistributionRepositoryMock.getHoldersCountForCorporateActionId.mockResolvedValue(10)
      onChainLifeCycleCashFlowServiceMock.executeDistribution.mockResolvedValue({} as any)

      const pausedAsset = AssetUtils.newInstance({ isPaused: true })
      const distribution = DistributionUtils.newInstance({
        asset: pausedAsset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: CorporateActionId.create(faker.string.alpha()),
          executionDate: faker.date.past(),
        },
      })

      validateAssetPauseStateDomainServiceMock.validateDomainPauseState.mockResolvedValue(undefined)

      await expect(executeCorporateActionDistributionDomainService.execute(distribution)).resolves.toBeUndefined()

      expect(validateAssetPauseStateDomainServiceMock.validateDomainPauseState).toHaveBeenCalledWith(
        distribution.asset,
        distribution.id,
      )
      expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).toHaveBeenCalled()
    })
  })
})
