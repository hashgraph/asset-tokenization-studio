// SPDX-License-Identifier: Apache-2.0

import { ConfigKeys } from "@config/config-keys"
import { AssetHederaTokenAddressAlreadyExistsError } from "@domain/errors/asset.error"
import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { LifeCycleCashFlowAddress } from "@domain/model/life-cycle-cash-flow-address.value-object"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"
import { GetAssetInfoResponse } from "@domain/ports/get-asset-info-response.interface"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { ImportAssetDomainService } from "@domain/services/import-asset.domain-service"
import { SyncFromOnChainDomainService } from "@domain/services/sync-from-onchain.domain-service"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress } from "@test/shared/utils"
import { HederaService } from "@domain/ports/hedera.port"

describe(ImportAssetDomainService.name, () => {
  let importAssetDomainService: ImportAssetDomainService
  const assetRepositoryMock = createMock<AssetRepository>()
  const onChainLifeCycleCashFlowServiceMock = createMock<LifeCycleCashFlowPort>()
  const assetTokenizationStudioServiceMock = createMock<AssetTokenizationStudioService>()
  const hederaServiceMock = createMock<HederaService>()
  const configServiceMock = createMock<ConfigService>()
  const syncFromOnChainDomainServiceMock = createMock<SyncFromOnChainDomainService>()
  const mockDate = faker.date.future()
  jest.spyOn(global, "Date").mockImplementation(() => mockDate)

  const mockUUID = "1cb83c9e-ad81-424a-9029-5dc861308aa3"
  jest.spyOn(crypto, "randomUUID").mockImplementation(() => mockUUID)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportAssetDomainService,
        {
          provide: "AssetRepository",
          useValue: assetRepositoryMock,
        },
        {
          provide: "OnChainLifeCycleCashFlowService",
          useValue: onChainLifeCycleCashFlowServiceMock,
        },
        {
          provide: "AssetTokenizationStudioService",
          useValue: assetTokenizationStudioServiceMock,
        },
        {
          provide: "HederaService",
          useValue: hederaServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: SyncFromOnChainDomainService,
          useValue: syncFromOnChainDomainServiceMock,
        },
      ],
    }).compile()

    importAssetDomainService = module.get<ImportAssetDomainService>(ImportAssetDomainService)

    jest.clearAllMocks()

    onChainLifeCycleCashFlowServiceMock.isPaused.mockResolvedValue(false)
  })

  describe("Import Asset", () => {
    it("should import asset successfully with lifeCycleCashFlow addresses and asset type from syncAsset", async () => {
      const name = "Test Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const hederaUsdcAddress = fakeHederaAddress()
      const lifeCycleCashFlowHederaAddress = fakeHederaAddress()
      const lifeCycleCashFlowEvmAddress = faker.finance.ethereumAddress()
      const symbol = faker.string.alpha({ length: 3 })
      const getAssetInfoResponse: GetAssetInfoResponse = {
        hederaTokenAddress: hederaTokenAddress,
        name: name,
        symbol: symbol,
        assetType: AssetType.EQUITY,
      }
      const lifeCycleCashFlowAddress = LifeCycleCashFlowAddress.create(
        lifeCycleCashFlowHederaAddress,
        lifeCycleCashFlowEvmAddress,
      )
      const initialAsset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol)
      const assetWithLifeCycleCashFlow = initialAsset.withLifeCycleCashFlow(lifeCycleCashFlowAddress)

      assetRepositoryMock.getAssetByName.mockResolvedValue(undefined)
      assetRepositoryMock.getAssetByHederaTokenAddress.mockResolvedValue(undefined)
      configServiceMock.get.mockReturnValue(hederaUsdcAddress)
      hederaServiceMock.getEvmAddressFromHedera.mockResolvedValue(evmTokenAddress)
      assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(getAssetInfoResponse)
      onChainLifeCycleCashFlowServiceMock.deployContract.mockResolvedValue(lifeCycleCashFlowAddress)
      assetRepositoryMock.saveAsset.mockResolvedValue(assetWithLifeCycleCashFlow)

      const result = await importAssetDomainService.importAsset(hederaTokenAddress)

      expect(configServiceMock.get).toHaveBeenCalledWith(ConfigKeys.HEDERA_USDC_ADDRESS)
      expect(hederaServiceMock.getEvmAddressFromHedera).toHaveBeenCalledWith(hederaTokenAddress)
      expect(assetTokenizationStudioServiceMock.getAssetInfo).toHaveBeenCalledWith(hederaTokenAddress)
      expect(onChainLifeCycleCashFlowServiceMock.isPaused).toHaveBeenCalledWith(hederaTokenAddress)
      expect(onChainLifeCycleCashFlowServiceMock.deployContract).toHaveBeenCalledWith(
        hederaTokenAddress,
        hederaUsdcAddress,
      )
      expect(assetRepositoryMock.saveAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          name: name,
          type: AssetType.EQUITY,
          hederaTokenAddress: hederaTokenAddress,
          evmTokenAddress: evmTokenAddress,
          isPaused: false,
          lifeCycleCashFlowHederaAddress: lifeCycleCashFlowHederaAddress,
          lifeCycleCashFlowEvmAddress: lifeCycleCashFlowEvmAddress,
        }),
      )
      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
      expect(result).toEqual(assetWithLifeCycleCashFlow)
      expect(syncFromOnChainDomainServiceMock.execute).toHaveBeenCalled()
    })

    it("should import an asset with BOND type from syncAsset response", async () => {
      const name = "Bond Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const hederaUsdcAddress = fakeHederaAddress()
      const lifeCycleCashFlowHederaAddress = fakeHederaAddress()
      const lifeCycleCashFlowEvmAddress = faker.finance.ethereumAddress()
      const getAssetInfoResponse: GetAssetInfoResponse = {
        hederaTokenAddress: hederaTokenAddress,
        name: name,
        symbol: faker.finance.currencySymbol(),
        assetType: AssetType.BOND_VARIABLE_RATE,
      }
      const lifeCycleCashFlowAddress = LifeCycleCashFlowAddress.create(
        lifeCycleCashFlowHederaAddress,
        lifeCycleCashFlowEvmAddress,
      )
      const symbol = faker.string.alpha({ length: 3 })
      const maturityDate = faker.date.future()
      const initialAsset = Asset.create(
        name,
        AssetType.BOND_VARIABLE_RATE,
        hederaTokenAddress,
        evmTokenAddress,
        symbol,
        maturityDate,
      )
      const assetWithLifeCycleCashFlow = initialAsset.withLifeCycleCashFlow(lifeCycleCashFlowAddress)

      assetRepositoryMock.getAssetByName.mockResolvedValue(undefined)
      assetRepositoryMock.getAssetByHederaTokenAddress.mockResolvedValue(undefined)
      configServiceMock.get.mockReturnValue(hederaUsdcAddress)
      hederaServiceMock.getEvmAddressFromHedera.mockResolvedValue(evmTokenAddress)
      assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(getAssetInfoResponse)
      onChainLifeCycleCashFlowServiceMock.deployContract.mockResolvedValue(lifeCycleCashFlowAddress)
      assetRepositoryMock.saveAsset.mockResolvedValue(assetWithLifeCycleCashFlow)

      const result = await importAssetDomainService.importAsset(hederaTokenAddress)

      expect(assetTokenizationStudioServiceMock.getAssetInfo).toHaveBeenCalledWith(hederaTokenAddress)
      expect(onChainLifeCycleCashFlowServiceMock.deployContract).toHaveBeenCalledWith(
        hederaTokenAddress,
        hederaUsdcAddress,
      )
      expect(assetRepositoryMock.saveAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          name: name,
          type: AssetType.BOND_VARIABLE_RATE,
          hederaTokenAddress: hederaTokenAddress,
          evmTokenAddress: evmTokenAddress,
          lifeCycleCashFlowHederaAddress: lifeCycleCashFlowHederaAddress,
          lifeCycleCashFlowEvmAddress: lifeCycleCashFlowEvmAddress,
        }),
      )
      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
      expect(result.type).toBe(AssetType.BOND_VARIABLE_RATE)
    })

    it("should handle errors during syncAsset call", async () => {
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const errorMessage = "Failed to sync asset from Hedera"
      assetRepositoryMock.getAssetByName.mockResolvedValue(undefined)
      assetRepositoryMock.getAssetByHederaTokenAddress.mockResolvedValue(undefined)
      hederaServiceMock.getEvmAddressFromHedera.mockResolvedValue(evmTokenAddress)
      assetTokenizationStudioServiceMock.getAssetInfo.mockRejectedValue(new Error(errorMessage))

      await expect(importAssetDomainService.importAsset(hederaTokenAddress)).rejects.toThrow(errorMessage)

      expect(assetTokenizationStudioServiceMock.getAssetInfo).toHaveBeenCalledWith(hederaTokenAddress)
      expect(assetRepositoryMock.saveAsset).not.toHaveBeenCalled()
      expect(syncFromOnChainDomainServiceMock.execute).not.toHaveBeenCalled()
    })

    it("should handle errors during asset creation", async () => {
      const hederaTokenAddress = "0.0.1234"
      const errorMessage = "Error converting Hedera address"
      assetRepositoryMock.getAssetByName.mockResolvedValue(undefined)
      assetRepositoryMock.getAssetByHederaTokenAddress.mockResolvedValue(undefined)

      hederaServiceMock.getEvmAddressFromHedera.mockRejectedValue(new Error(errorMessage))

      await expect(importAssetDomainService.importAsset(hederaTokenAddress)).rejects.toThrow(`${errorMessage}`)
    })

    it("should handle errors during contract deployment", async () => {
      const name = "Test Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const hederaUsdcAddress = fakeHederaAddress()
      const errorMessage = "Contract deployment failed"
      const getAssetInfoResponse: GetAssetInfoResponse = {
        hederaTokenAddress: hederaTokenAddress,
        name: name,
        symbol: faker.finance.currencySymbol(),
        assetType: AssetType.EQUITY,
      }
      assetRepositoryMock.getAssetByName.mockResolvedValue(undefined)
      assetRepositoryMock.getAssetByHederaTokenAddress.mockResolvedValue(undefined)

      const symbol = faker.string.alpha({ length: 3 })
      const initialAsset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol)

      configServiceMock.get.mockReturnValue(hederaUsdcAddress)
      hederaServiceMock.getEvmAddressFromHedera.mockResolvedValue(evmTokenAddress)
      assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(getAssetInfoResponse)
      assetRepositoryMock.saveAsset.mockResolvedValue(initialAsset)
      onChainLifeCycleCashFlowServiceMock.deployContract.mockRejectedValue(new Error(errorMessage))

      await expect(importAssetDomainService.importAsset(hederaTokenAddress)).rejects.toThrow(`${errorMessage}`)

      expect(assetTokenizationStudioServiceMock.getAssetInfo).toHaveBeenCalledWith(hederaTokenAddress)
      expect(onChainLifeCycleCashFlowServiceMock.deployContract).toHaveBeenCalledWith(
        hederaTokenAddress,
        hederaUsdcAddress,
      )
      expect(assetRepositoryMock.saveAsset).not.toHaveBeenCalled()
      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
      expect(syncFromOnChainDomainServiceMock.execute).not.toHaveBeenCalled()
    })

    it("should throw an error if asset with same name already exists", async () => {
      const name = faker.commerce.productName()
      const hederaTokenAddress = fakeHederaAddress()
      const symbol = faker.string.alpha({ length: 3 })
      const evmAddress = faker.finance.ethereumAddress()
      const initialAsset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmAddress, symbol)
      assetRepositoryMock.getAssetByName.mockResolvedValue(initialAsset)

      await expect(importAssetDomainService.importAsset(hederaTokenAddress)).rejects.toThrow(Error)

      expect(assetRepositoryMock.getAssetByHederaTokenAddress).toHaveBeenCalled()
      expect(assetTokenizationStudioServiceMock.getAssetInfo).toHaveBeenCalled()
      expect(assetRepositoryMock.getAssetByName).not.toHaveBeenCalledWith(name)
      expect(syncFromOnChainDomainServiceMock.execute).not.toHaveBeenCalled()
    })

    it("should throw an error if asset with same token address already exists", async () => {
      const name = faker.commerce.productName()
      const hederaTokenAddress = fakeHederaAddress()
      assetRepositoryMock.getAssetByName.mockResolvedValue(undefined)
      const symbol = faker.string.alpha({ length: 3 })
      const evmTokenAddress = faker.finance.ethereumAddress()
      const initialAsset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol)
      assetRepositoryMock.getAssetByHederaTokenAddress.mockResolvedValue(initialAsset)

      await expect(importAssetDomainService.importAsset(hederaTokenAddress)).rejects.toThrow(
        AssetHederaTokenAddressAlreadyExistsError,
      )

      expect(assetRepositoryMock.getAssetByHederaTokenAddress).toHaveBeenCalledWith(hederaTokenAddress)
    })

    it("should import an asset with isPaused true when contract is paused", async () => {
      const name = "Paused Asset"
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const hederaUsdcAddress = fakeHederaAddress()
      const lifeCycleCashFlowHederaAddress = fakeHederaAddress()
      const lifeCycleCashFlowEvmAddress = faker.finance.ethereumAddress()

      const getAssetInfoResponse: GetAssetInfoResponse = {
        hederaTokenAddress: hederaTokenAddress,
        name: name,
        symbol: faker.finance.currencySymbol(),
        assetType: AssetType.EQUITY,
      }

      const lifeCycleCashFlowAddress = LifeCycleCashFlowAddress.create(
        lifeCycleCashFlowHederaAddress,
        lifeCycleCashFlowEvmAddress,
      )
      const symbol = faker.string.alpha({ length: 3 })
      const initialAsset = Asset.create(name, AssetType.EQUITY, hederaTokenAddress, evmTokenAddress, symbol).pause()
      const assetWithLifeCycleCashFlow = initialAsset.withLifeCycleCashFlow(lifeCycleCashFlowAddress)

      assetRepositoryMock.getAssetByName.mockResolvedValue(undefined)
      assetRepositoryMock.getAssetByHederaTokenAddress.mockResolvedValue(undefined)
      configServiceMock.get.mockReturnValue(hederaUsdcAddress)
      hederaServiceMock.getEvmAddressFromHedera.mockResolvedValue(evmTokenAddress)
      assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(getAssetInfoResponse)
      onChainLifeCycleCashFlowServiceMock.isPaused.mockResolvedValue(true)
      assetRepositoryMock.saveAsset.mockResolvedValue(initialAsset)
      onChainLifeCycleCashFlowServiceMock.deployContract.mockResolvedValue(lifeCycleCashFlowAddress)
      assetRepositoryMock.updateAsset.mockResolvedValue(assetWithLifeCycleCashFlow)

      const result = await importAssetDomainService.importAsset(hederaTokenAddress)

      expect(onChainLifeCycleCashFlowServiceMock.isPaused).toHaveBeenCalledWith(hederaTokenAddress)
      expect(assetRepositoryMock.saveAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          name: name,
          type: AssetType.EQUITY,
          hederaTokenAddress: hederaTokenAddress,
          evmTokenAddress: evmTokenAddress,
          isPaused: true,
        }),
      )
      expect(result.isPaused).toBe(true)
      expect(syncFromOnChainDomainServiceMock.execute).toHaveBeenCalled()
    })
  })
})
