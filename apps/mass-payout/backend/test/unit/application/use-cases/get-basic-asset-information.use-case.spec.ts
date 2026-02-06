// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { GetBasicAssetInformationUseCase } from "@application/use-cases/get-basic-asset-information.use-case"
import { AssetType } from "@domain/model/asset-type.enum"
import { createMock } from "@golevelup/ts-jest"
import { faker } from "@faker-js/faker"
import { fakeHederaAddress } from "@test/shared/utils"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"

describe(GetBasicAssetInformationUseCase.name, () => {
  let getBasicAssetInformationUseCase: GetBasicAssetInformationUseCase
  const assetTokenizationStudioServiceMock = createMock<AssetTokenizationStudioService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBasicAssetInformationUseCase,
        {
          provide: "AssetTokenizationStudioService",
          useValue: assetTokenizationStudioServiceMock,
        },
      ],
    }).compile()

    getBasicAssetInformationUseCase = module.get<GetBasicAssetInformationUseCase>(GetBasicAssetInformationUseCase)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should return basic asset information without maturity date for equity", async () => {
      const hederaTokenAddress = fakeHederaAddress()
      const name = faker.finance.accountName()
      const symbol = faker.finance.currencyCode()

      const mockAssetInfo = {
        hederaTokenAddress,
        name,
        symbol,
        assetType: AssetType.EQUITY,
      }
      assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(mockAssetInfo)

      const result = await getBasicAssetInformationUseCase.execute(hederaTokenAddress)

      expect(assetTokenizationStudioServiceMock.getAssetInfo).toHaveBeenCalledWith(hederaTokenAddress)
      expect(result).toEqual({
        hederaTokenAddress,
        name,
        symbol,
        assetType: AssetType.EQUITY,
        maturityDate: undefined,
      })
    })

    it("should return basic asset information with maturity date for bond", async () => {
      const hederaTokenAddress = fakeHederaAddress()
      const name = faker.finance.accountName()
      const symbol = faker.finance.currencyCode()
      const maturityDate = faker.date.future()

      const mockAssetInfo = {
        hederaTokenAddress,
        name,
        symbol,
        assetType: AssetType.BOND_VARIABLE_RATE,
        maturityDate,
      }
      assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(mockAssetInfo)

      const result = await getBasicAssetInformationUseCase.execute(hederaTokenAddress)

      expect(assetTokenizationStudioServiceMock.getAssetInfo).toHaveBeenCalledWith(hederaTokenAddress)
      expect(result).toEqual({
        hederaTokenAddress,
        name,
        symbol,
        assetType: AssetType.BOND_VARIABLE_RATE,
        maturityDate,
      })
    })

    it("should throw error when repository fails", async () => {
      const hederaTokenAddress = fakeHederaAddress()
      const errorMessage = "Failed to get asset info from blockchain"
      assetTokenizationStudioServiceMock.getAssetInfo.mockRejectedValue(new Error(errorMessage))

      await expect(getBasicAssetInformationUseCase.execute(hederaTokenAddress)).rejects.toThrow(errorMessage)

      expect(assetTokenizationStudioServiceMock.getAssetInfo).toHaveBeenCalledWith(hederaTokenAddress)
    })

    it("should propagate asset not found error from repository", async () => {
      const hederaTokenAddress = fakeHederaAddress()
      const notFoundError = new Error("Asset not found on blockchain")
      assetTokenizationStudioServiceMock.getAssetInfo.mockRejectedValue(notFoundError)

      await expect(getBasicAssetInformationUseCase.execute(hederaTokenAddress)).rejects.toThrow(notFoundError)

      expect(assetTokenizationStudioServiceMock.getAssetInfo).toHaveBeenCalledWith(hederaTokenAddress)
    })

    it("should handle all asset types correctly", async () => {
      const hederaTokenAddress = fakeHederaAddress()
      const name = faker.finance.accountName()
      const symbol = faker.finance.currencyCode()
      const assetTypes = [AssetType.EQUITY, AssetType.BOND_VARIABLE_RATE]

      for (const assetType of assetTypes) {
        const mockAssetInfo = {
          hederaTokenAddress,
          name,
          symbol,
          assetType,
          maturityDate: assetType === AssetType.BOND_VARIABLE_RATE ? faker.date.future() : undefined,
        }
        assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(mockAssetInfo)

        const result = await getBasicAssetInformationUseCase.execute(hederaTokenAddress)

        expect(result.assetType).toBe(assetType)
        expect(result.hederaTokenAddress).toBe(hederaTokenAddress)
        expect(result.name).toBe(name)
        expect(result.symbol).toBe(symbol)
        if (assetType === AssetType.BOND_VARIABLE_RATE) {
          expect(result.maturityDate).toBeDefined()
        }
      }
    })
  })
})
