// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Asset } from "@domain/model/asset"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { UpdateAssetDomainService } from "@domain/services/update-asset.domain-service"
import { fakeHederaAddress } from "@test/shared/utils"
import { AssetNameAlreadyExistsError, AssetNotFoundError } from "@domain/errors/asset.error"
import { AssetType } from "@domain/model/asset-type.enum"

describe(UpdateAssetDomainService.name, () => {
  let updateAssetDomainService: UpdateAssetDomainService
  const assetRepositoryMock = createMock<AssetRepository>()

  const mockDate = faker.date.future()
  jest.spyOn(global, "Date").mockImplementation(() => mockDate)

  const mockUUID = "1cb83c9e-ad81-424a-9029-5dc861308aa3"
  jest.spyOn(crypto, "randomUUID").mockImplementation(() => mockUUID)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAssetDomainService,
        {
          provide: "AssetRepository",
          useValue: assetRepositoryMock,
        },
      ],
    }).compile()

    updateAssetDomainService = module.get<UpdateAssetDomainService>(UpdateAssetDomainService)

    jest.clearAllMocks()
  })

  describe("updateAsset", () => {
    it("should update an asset's name successfully", async () => {
      const assetId = faker.string.uuid()
      const oldName = faker.company.name()
      const newName = faker.company.name()
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const maturityDate = faker.date.future()
      const existingAsset = Asset.create(
        oldName,
        AssetType.BOND_VARIABLE_RATE,
        hederaTokenAddress,
        evmTokenAddress,
        symbol,
        maturityDate,
      )

      assetRepositoryMock.getAsset.mockResolvedValue(existingAsset)
      assetRepositoryMock.getAssetByName.mockResolvedValue(undefined)

      const result = await updateAssetDomainService.updateAsset(assetId, newName)

      expect(result).toBeInstanceOf(Asset)
      expect(result.id).toBe(existingAsset.id)
      expect(result.name).toBe(newName)
      expect(result.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(result.evmTokenAddress).toBe(evmTokenAddress)
      expect(result.updatedAt).toBe(mockDate)
      expect(assetRepositoryMock.updateAsset).toHaveBeenCalledTimes(1)
    })

    it("should throw AssetNotFoundError when asset does not exist", async () => {
      const assetId = faker.string.uuid()
      const newName = faker.company.name()

      assetRepositoryMock.getAsset.mockResolvedValue(undefined)

      await expect(updateAssetDomainService.updateAsset(assetId, newName)).rejects.toThrow(
        new AssetNotFoundError(assetId),
      )

      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
    })

    it("should throw AssetNameAlreadyExistsError when new name is already taken", async () => {
      const assetId = faker.string.uuid()
      const oldName = faker.company.name()
      const newName = faker.company.name()
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol1 = faker.string.alpha({ length: 3 })
      const maturityDate1 = faker.date.future()
      const existingAsset = Asset.create(
        oldName,
        AssetType.BOND_VARIABLE_RATE,
        hederaTokenAddress,
        evmTokenAddress,
        symbol1,
        maturityDate1,
      )
      const symbol2 = faker.string.alpha({ length: 3 })
      const maturityDate2 = faker.date.future()
      const otherAsset = Asset.create(
        newName,
        AssetType.BOND_VARIABLE_RATE,
        fakeHederaAddress(),
        faker.finance.ethereumAddress(),
        symbol2,
        maturityDate2,
      )

      assetRepositoryMock.getAsset.mockResolvedValue(existingAsset)
      assetRepositoryMock.getAssetByName.mockResolvedValue(otherAsset)

      await expect(updateAssetDomainService.updateAsset(assetId, newName)).rejects.toThrow(
        new AssetNameAlreadyExistsError(newName),
      )

      expect(assetRepositoryMock.updateAsset).not.toHaveBeenCalled()
    })
  })
})
