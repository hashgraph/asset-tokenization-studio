// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { PauseAssetDomainService } from "@domain/services/pause-asset.domain-service"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress } from "@test/shared/utils"

//TODO ruben.martinez uncomment when these tests are fixed on main.
describe.skip(PauseAssetDomainService.name, () => {
  let pauseAssetDomainService: PauseAssetDomainService
  const assetRepositoryMock = createMock<AssetRepository>()
  const onChainLifeCycleCashFlowServiceMock = createMock<LifeCycleCashFlowPort>()

  const mockDate = faker.date.future()
  jest.spyOn(global, "Date").mockImplementation(() => mockDate)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PauseAssetDomainService,
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

    pauseAssetDomainService = module.get<PauseAssetDomainService>(PauseAssetDomainService)

    jest.clearAllMocks()
  })

  describe("pause", () => {
    it("should pause an asset successfully", async () => {
      const assetId = faker.string.uuid()
      const name = "Test Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol)
      const pausedAsset = asset.pause()

      assetRepositoryMock.getAsset.mockResolvedValue(asset)
      onChainLifeCycleCashFlowServiceMock.pause.mockResolvedValue(true)
      assetRepositoryMock.updateAsset.mockResolvedValue(pausedAsset)

      const result = await pauseAssetDomainService.pause(assetId)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.pause).toHaveBeenCalledWith(undefined)
      expect(assetRepositoryMock.updateAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          id: asset.id,
          name: name,
          type: AssetType.EQUITY,
          hederaTokenAddress: hederaTokenAddress,
          evmTokenAddress: evmTokenAddress,
          isPaused: true,
        }),
      )
      expect(result).toEqual(pausedAsset)
      expect(result.isPaused).toBe(true)
    })

    it("should return asset without changes when asset is already paused", async () => {
      const assetId = faker.string.uuid()
      const name = "Already Paused Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const alreadyPausedAsset = Asset.create(
        name,
        AssetType.EQUITY,
        hederaTokenAddress,
        evmTokenAddress,
        symbol,
      ).pause()

      assetRepositoryMock.getAsset.mockResolvedValue(alreadyPausedAsset)

      const result = await pauseAssetDomainService.pause(assetId)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.pause).not.toHaveBeenCalled()
      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
      expect(result).toEqual(alreadyPausedAsset)
      expect(result.isPaused).toBe(true)
    })

    it("should throw error when asset not found", async () => {
      const assetId = faker.string.uuid()

      assetRepositoryMock.getAsset.mockResolvedValue(null)

      await expect(pauseAssetDomainService.pause(assetId)).rejects.toThrow(`Asset with ID ${assetId} not found`)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.pause).not.toHaveBeenCalled()
      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
    })

    it("should handle on-chain pause failure", async () => {
      const assetId = faker.string.uuid()
      const name = "Test Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const errorMessage = "On-chain pause failed"

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol)

      assetRepositoryMock.getAsset.mockResolvedValue(asset)
      onChainLifeCycleCashFlowServiceMock.pause.mockRejectedValue(new Error(errorMessage))

      await expect(pauseAssetDomainService.pause(assetId)).rejects.toThrow(errorMessage)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.pause).toHaveBeenCalledWith(undefined)
      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
    })

    it("should handle repository update failure", async () => {
      const assetId = faker.string.uuid()
      const name = "Test Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const errorMessage = "Repository update failed"

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol)

      assetRepositoryMock.getAsset.mockResolvedValue(asset)
      onChainLifeCycleCashFlowServiceMock.pause.mockResolvedValue(true)
      assetRepositoryMock.updateAsset.mockRejectedValue(new Error(errorMessage))

      await expect(pauseAssetDomainService.pause(assetId)).rejects.toThrow(errorMessage)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(onChainLifeCycleCashFlowServiceMock.pause).toHaveBeenCalledWith(undefined)
      expect(assetRepositoryMock.updateAsset).toHaveBeenCalled()
    })

    it("should pause asset with lifecycle cash flow addresses", async () => {
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
        AssetType.BOND,
        hederaTokenAddress,
        evmTokenAddress,
        symbol,
        maturityDate,
        lifeCycleCashFlowHederaAddress,
        lifeCycleCashFlowEvmAddress,
        false,
        true,
        faker.date.past(),
        faker.date.recent(),
      )
      const pausedAsset = asset.pause()

      assetRepositoryMock.getAsset.mockResolvedValue(asset)
      onChainLifeCycleCashFlowServiceMock.pause.mockResolvedValue(true)
      assetRepositoryMock.updateAsset.mockResolvedValue(pausedAsset)

      const result = await pauseAssetDomainService.pause(assetId)

      expect(onChainLifeCycleCashFlowServiceMock.pause).toHaveBeenCalledWith(lifeCycleCashFlowHederaAddress)
      expect(assetRepositoryMock.updateAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          lifeCycleCashFlowHederaAddress: lifeCycleCashFlowHederaAddress,
          lifeCycleCashFlowEvmAddress: lifeCycleCashFlowEvmAddress,
          isPaused: true,
        }),
      )
      expect(result.isPaused).toBe(true)
      expect(result.lifeCycleCashFlowHederaAddress).toBe(lifeCycleCashFlowHederaAddress)
      expect(result.lifeCycleCashFlowEvmAddress).toBe(lifeCycleCashFlowEvmAddress)
    })
  })
})
