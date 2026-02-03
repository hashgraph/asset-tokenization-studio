// SPDX-License-Identifier: Apache-2.0

import { AssetType } from "@domain/model/asset-type.enum"
import { CorporateActionDetails, Distribution, DistributionType } from "@domain/model/distribution"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { OnChainDistributionRepositoryPort } from "@domain/ports/on-chain-distribution-repository.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { SyncFromOnChainDomainService } from "@domain/services/sync-from-onchain.domain-service"
import { faker } from "@faker-js/faker"
import { createMock, DeepMocked } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { AssetUtils } from "@test/shared/asset.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"

describe(SyncFromOnChainDomainService.name, () => {
  let service: SyncFromOnChainDomainService
  let assetsRepositoryMock: DeepMocked<AssetRepository>
  let distributionsRepositoryMock: DeepMocked<DistributionRepository>
  let onChainDistributionRepositoryMock: DeepMocked<OnChainDistributionRepositoryPort>
  let lifeCycleCashFlowPortMock: DeepMocked<LifeCycleCashFlowPort>

  beforeEach(async () => {
    assetsRepositoryMock = createMock<AssetRepository>()
    distributionsRepositoryMock = createMock<DistributionRepository>()
    onChainDistributionRepositoryMock = createMock<OnChainDistributionRepositoryPort>()
    lifeCycleCashFlowPortMock = createMock<LifeCycleCashFlowPort>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncFromOnChainDomainService,
        {
          provide: "AssetRepository",
          useValue: assetsRepositoryMock,
        },
        {
          provide: "DistributionRepository",
          useValue: distributionsRepositoryMock,
        },
        {
          provide: "OnChainDistributionRepositoryPort",
          useValue: onChainDistributionRepositoryMock,
        },
        {
          provide: "LifeCycleCashFlowPort",
          useValue: lifeCycleCashFlowPortMock,
        },
      ],
    }).compile()

    service = module.get<SyncFromOnChainDomainService>(SyncFromOnChainDomainService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("execute", () => {
    it("should do nothing when no assets exist", async () => {
      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([])

      await service.execute()

      expect(assetsRepositoryMock.getAllSyncEnabledAssets).toHaveBeenCalledTimes(1)
      expect(onChainDistributionRepositoryMock.getAllDistributionsByAsset).not.toHaveBeenCalled()
    })

    it("creates new distribution when it doesn't exist locally", async () => {
      const asset = AssetUtils.newInstance()
      const corporateActionId = faker.string.uuid()
      const executionDate = faker.date.future()
      const remote = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: { value: corporateActionId },
          executionDate,
        } as CorporateActionDetails,
      })

      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([asset])
      assetsRepositoryMock.getAsset.mockResolvedValue(asset)
      onChainDistributionRepositoryMock.getAllDistributionsByAsset.mockResolvedValue([remote])
      distributionsRepositoryMock.findByCorporateActionId.mockResolvedValue(null)

      await service.execute()

      expect(distributionsRepositoryMock.saveDistribution).toHaveBeenCalledTimes(1)
      const saved = distributionsRepositoryMock.saveDistribution.mock.calls[0][0] as Distribution
      expect((saved.details as CorporateActionDetails).corporateActionId.value).toBe(corporateActionId)
      expect((saved.details as CorporateActionDetails).executionDate.valueOf()).toBe(executionDate.valueOf())
    })

    it("skips update when executionDate has not changed", async () => {
      const asset = AssetUtils.newInstance()
      const corporateActionId = faker.string.uuid()
      const executionDate = faker.date.future()
      const remote = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: { value: corporateActionId },
          executionDate,
        } as CorporateActionDetails,
      })
      const local = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: { value: corporateActionId },
          executionDate,
        } as CorporateActionDetails,
      })

      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([asset])
      onChainDistributionRepositoryMock.getAllDistributionsByAsset.mockResolvedValue([remote])
      distributionsRepositoryMock.findByCorporateActionId.mockResolvedValue(local)

      await service.execute()

      expect(distributionsRepositoryMock.saveDistribution).not.toHaveBeenCalled()
    })

    it("updates executionDate when it has changed", async () => {
      const asset = AssetUtils.newInstance()
      const corporateActionId = faker.string.uuid()
      const executionDate = faker.date.future()
      const remote = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: { value: corporateActionId },
          executionDate,
        } as CorporateActionDetails,
      })
      const local = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: { value: corporateActionId },
          executionDate: faker.date.future({ years: 1 }),
        } as CorporateActionDetails,
      })

      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([asset])
      onChainDistributionRepositoryMock.getAllDistributionsByAsset.mockResolvedValue([remote])
      distributionsRepositoryMock.findByCorporateActionId.mockResolvedValue(local)

      await service.execute()

      expect(distributionsRepositoryMock.saveDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          asset,
          details: expect.objectContaining({
            executionDate: (remote.details as CorporateActionDetails).executionDate,
          }),
        }),
      )
    })

    it("should sync distributions for equity assets", async () => {
      const equityAsset = AssetUtils.newInstance({ type: AssetType.EQUITY })
      const corporateActionId = faker.string.uuid()
      const executionDate = faker.date.future()
      const remote = DistributionUtils.newInstance({
        asset: equityAsset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: { value: corporateActionId },
          executionDate,
        } as CorporateActionDetails,
      })
      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([equityAsset])
      onChainDistributionRepositoryMock.getAllDistributionsByAsset.mockResolvedValue([remote])
      distributionsRepositoryMock.findByCorporateActionId.mockResolvedValue(null)

      await service.execute()

      expect(onChainDistributionRepositoryMock.getAllDistributionsByAsset).toHaveBeenCalledWith(equityAsset)
      expect(distributionsRepositoryMock.findByCorporateActionId).toHaveBeenCalledWith(
        equityAsset.id,
        corporateActionId,
      )
      expect(distributionsRepositoryMock.saveDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          asset: equityAsset,
          details: expect.objectContaining({
            executionDate,
          }),
        }),
      )
    })

    it("should create new distribution when it doesn't exist locally", async () => {
      const asset = AssetUtils.newInstance()
      const corporateActionId = faker.string.uuid()
      const executionDate = faker.date.future()
      const corporateActionIdObj = { value: corporateActionId } as any
      const onChainDistribution = Distribution.createCorporateAction(asset, corporateActionIdObj, executionDate)
      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([asset])
      onChainDistributionRepositoryMock.getAllDistributionsByAsset.mockResolvedValue([onChainDistribution])
      distributionsRepositoryMock.findByCorporateActionId.mockResolvedValue(null)

      await service.execute()

      expect(distributionsRepositoryMock.findByCorporateActionId).toHaveBeenCalledWith(asset.id, corporateActionId)
      expect(distributionsRepositoryMock.saveDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          asset,
          details: expect.objectContaining({
            corporateActionId: expect.objectContaining({ value: corporateActionId }),
            executionDate,
          }),
        }),
      )
    })

    it("should update distribution when execution date has changed", async () => {
      const asset = AssetUtils.newInstance()
      const corporateActionId = faker.string.uuid()
      const oldExecutionDate = faker.date.soon({ days: 1 })
      const newExecutionDate = faker.date.future({ years: 30 })
      const corporateActionIdObj2 = { value: corporateActionId } as any
      const onChainDistribution = Distribution.createCorporateAction(asset, corporateActionIdObj2, newExecutionDate)
      const existingDistribution = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: { value: corporateActionId } as any,
          executionDate: oldExecutionDate,
        } as any,
      })
      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([asset])
      onChainDistributionRepositoryMock.getAllDistributionsByAsset.mockResolvedValue([onChainDistribution])
      distributionsRepositoryMock.findByCorporateActionId.mockResolvedValue(existingDistribution)

      await service.execute()

      expect(distributionsRepositoryMock.saveDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingDistribution.id,
          details: expect.objectContaining({
            executionDate: newExecutionDate,
          }),
        }),
      )
    })

    it("should skip update when execution date hasn't changed", async () => {
      const asset = AssetUtils.newInstance()
      const corporateActionId = faker.string.uuid()
      const executionDate = faker.date.future()
      const corporateActionIdObj3 = { value: corporateActionId } as any
      const onChainDistribution = Distribution.createCorporateAction(asset, corporateActionIdObj3, executionDate)
      const existingDistribution = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId: { value: corporateActionId } as any,
          executionDate,
        } as any,
      })
      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([asset])
      onChainDistributionRepositoryMock.getAllDistributionsByAsset.mockResolvedValue([onChainDistribution])
      distributionsRepositoryMock.findByCorporateActionId.mockResolvedValue(existingDistribution)

      await service.execute()

      expect(distributionsRepositoryMock.updateDistribution).not.toHaveBeenCalled()
      expect(distributionsRepositoryMock.saveDistribution).not.toHaveBeenCalled()
    })

    it("should handle multiple assets correctly", async () => {
      const bondAsset = AssetUtils.newInstance({ type: AssetType.BOND })
      const equityAsset = AssetUtils.newInstance({ type: AssetType.EQUITY })
      const bondCorporateActionId = { value: "bond-1" } as any
      const equityCorporateActionId = { value: "equity-1" } as any
      const bondDistribution = Distribution.createCorporateAction(bondAsset, bondCorporateActionId, faker.date.future())
      const equityDistribution = Distribution.createCorporateAction(
        equityAsset,
        equityCorporateActionId,
        faker.date.future(),
      )
      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([bondAsset, equityAsset])
      onChainDistributionRepositoryMock.getAllDistributionsByAsset
        .mockResolvedValueOnce([bondDistribution])
        .mockResolvedValueOnce([equityDistribution])
      distributionsRepositoryMock.findByCorporateActionId.mockResolvedValue(null)

      await service.execute()

      expect(onChainDistributionRepositoryMock.getAllDistributionsByAsset).toHaveBeenCalledTimes(2)
      expect(onChainDistributionRepositoryMock.getAllDistributionsByAsset).toHaveBeenCalledWith(bondAsset)
      expect(onChainDistributionRepositoryMock.getAllDistributionsByAsset).toHaveBeenCalledWith(equityAsset)
      expect(distributionsRepositoryMock.saveDistribution).toHaveBeenCalledTimes(2)
    })

    it("should handle empty distributions from on-chain", async () => {
      const asset = AssetUtils.newInstance()
      assetsRepositoryMock.getAllSyncEnabledAssets.mockResolvedValue([asset])
      onChainDistributionRepositoryMock.getAllDistributionsByAsset.mockResolvedValue([])

      await service.execute()

      expect(onChainDistributionRepositoryMock.getAllDistributionsByAsset).toHaveBeenCalledWith(asset)
      expect(distributionsRepositoryMock.findByCorporateActionId).not.toHaveBeenCalled()
      expect(distributionsRepositoryMock.saveDistribution).not.toHaveBeenCalled()
      expect(distributionsRepositoryMock.updateDistribution).not.toHaveBeenCalled()
    })
  })
})
