// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { UnpauseAssetDomainService } from "@domain/services/unpause-asset.domain-service"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress } from "@test/shared/utils"

describe(UnpauseAssetDomainService.name, () => {
  let unpauseAssetDomainService: UnpauseAssetDomainService
  const assetRepositoryMock = createMock<AssetRepository>()
  const onChainLifeCycleCashFlowServiceMock = createMock<LifeCycleCashFlowPort>()

  const mockDate = faker.date.future()
  jest.spyOn(global, "Date").mockImplementation(() => mockDate)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnpauseAssetDomainService,
        {
          provide: "AssetRepository",
          useValue: assetRepositoryMock,
        },
        {
          provide: "OnChainLifeCycleCashFlowService",
          useValue: onChainLifeCycleCashFlowServiceMock,
        },
      ],
    }).compile()

    unpauseAssetDomainService = module.get<UnpauseAssetDomainService>(UnpauseAssetDomainService)

    jest.clearAllMocks()
  })

  describe("unpause", () => {
    it("should unpause an asset successfully", async () => {
      const assetId = faker.string.uuid()
      const name = "Test Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol).pause()
      const unpausedAsset = asset.unpause()

      assetRepositoryMock.getAsset.mockResolvedValue(asset)
      onChainLifeCycleCashFlowServiceMock.unpause.mockResolvedValue(true)
      assetRepositoryMock.updateAsset.mockResolvedValue(unpausedAsset)

      const result = await unpauseAssetDomainService.unpause(assetId)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.unpause).toHaveBeenCalledWith(asset.lifeCycleCashFlowHederaAddress)
      expect(assetRepositoryMock.updateAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          id: asset.id,
          name: name,
          type: AssetType.EQUITY,
          hederaTokenAddress: hederaTokenAddress,
          evmTokenAddress: evmTokenAddress,
          isPaused: false,
        }),
      )
      expect(result).toEqual(unpausedAsset)
      expect(result.isPaused).toBe(false)
    })

    it("should return asset without changes when asset is already unpaused", async () => {
      const assetId = faker.string.uuid()
      const name = "Already Unpaused Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const alreadyUnpausedAsset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol)

      assetRepositoryMock.getAsset.mockResolvedValue(alreadyUnpausedAsset)

      const result = await unpauseAssetDomainService.unpause(assetId)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.unpause).not.toHaveBeenCalled()
      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
      expect(result).toEqual(alreadyUnpausedAsset)
      expect(result.isPaused).toBe(false)
    })

    it("should throw error when asset not found", async () => {
      const assetId = faker.string.uuid()

      assetRepositoryMock.getAsset.mockResolvedValue(null)

      await expect(unpauseAssetDomainService.unpause(assetId)).rejects.toThrow(`Asset with ID ${assetId} not found`)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.unpause).not.toHaveBeenCalled()
      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
    })

    it("should handle on-chain unpause failure", async () => {
      const assetId = faker.string.uuid()
      const name = "Test Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const errorMessage = "On-chain unpause failed"

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol).pause()

      assetRepositoryMock.getAsset.mockResolvedValue(asset)
      onChainLifeCycleCashFlowServiceMock.unpause.mockRejectedValue(new Error(errorMessage))

      await expect(unpauseAssetDomainService.unpause(assetId)).rejects.toThrow(errorMessage)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.unpause).toHaveBeenCalledWith(asset.lifeCycleCashFlowHederaAddress)
      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
    })

    it("should handle repository update failure", async () => {
      const assetId = faker.string.uuid()
      const name = "Test Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const errorMessage = "Repository update failed"

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol).pause()

      assetRepositoryMock.getAsset.mockResolvedValue(asset)
      onChainLifeCycleCashFlowServiceMock.unpause.mockResolvedValue(true)
      assetRepositoryMock.updateAsset.mockRejectedValue(new Error(errorMessage))

      await expect(unpauseAssetDomainService.unpause(assetId)).rejects.toThrow(errorMessage)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.unpause).toHaveBeenCalledWith(asset.lifeCycleCashFlowHederaAddress)
      expect(assetRepositoryMock.updateAsset).toHaveBeenCalled()
    })

    it("should unpause asset with lifecycle cash flow addresses", async () => {
      const assetId = faker.string.uuid()
      const name = "Asset with Lifecycle"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const lifeCycleCashFlowHederaAddress = fakeHederaAddress()
      const lifeCycleCashFlowEvmAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const maturityDate = faker.date.future()
      const asset = Asset.createExisting(
        assetId,
        name,
        AssetType.BOND_VARIABLE_RATE,
        hederaTokenAddress,
        evmTokenAddress,
        symbol,
        maturityDate,
        lifeCycleCashFlowHederaAddress,
        lifeCycleCashFlowEvmAddress,
        true,
        true,
        faker.date.past(),
        faker.date.recent(),
      )
      const unpausedAsset = asset.unpause()

      assetRepositoryMock.getAsset.mockResolvedValue(asset)
      onChainLifeCycleCashFlowServiceMock.unpause.mockResolvedValue(true)
      assetRepositoryMock.updateAsset.mockResolvedValue(unpausedAsset)

      const result = await unpauseAssetDomainService.unpause(assetId)

      expect(onChainLifeCycleCashFlowServiceMock.unpause).toHaveBeenCalledWith(lifeCycleCashFlowHederaAddress)
      expect(assetRepositoryMock.updateAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          lifeCycleCashFlowHederaAddress: lifeCycleCashFlowHederaAddress,
          lifeCycleCashFlowEvmAddress: lifeCycleCashFlowEvmAddress,
          isPaused: false,
        }),
      )
      expect(result.isPaused).toBe(false)
      expect(result.lifeCycleCashFlowHederaAddress).toBe(lifeCycleCashFlowHederaAddress)
      expect(result.lifeCycleCashFlowEvmAddress).toBe(lifeCycleCashFlowEvmAddress)
    })
  })
})
