// SPDX-License-Identifier: Apache-2.0

import { GetAssetUseCase } from "@application/use-cases/get-asset.use-case"
import { AssetNotFoundError } from "@domain/errors/asset.error"
import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress } from "@test/shared/utils"

describe(GetAssetUseCase.name, () => {
  let getAssetUseCase: GetAssetUseCase
  const assetRepositoryMock = createMock<AssetRepository>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAssetUseCase,
        {
          provide: "AssetRepository",
          useValue: assetRepositoryMock,
        },
      ],
    }).compile()

    getAssetUseCase = module.get<GetAssetUseCase>(GetAssetUseCase)

    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should return asset when found", async () => {
      const id = faker.string.uuid()
      const name = faker.commerce.productName()
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const expectedAsset = new Asset(
        id,
        name,
        AssetType.EQUITY,
        hederaTokenAddress,
        evmTokenAddress,
        symbol,
        undefined,
        undefined,
        undefined,
        false,
        true,
        new Date(),
        new Date(),
      )

      assetRepositoryMock.getAsset.mockResolvedValue(expectedAsset)

      const result = await getAssetUseCase.execute(id)

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedAsset)
    })

    it("should throw AssetNotFoundError when asset is not found", async () => {
      const id = faker.string.uuid()

      assetRepositoryMock.getAsset.mockResolvedValue(null)

      await expect(getAssetUseCase.execute(id)).rejects.toThrow(new AssetNotFoundError(id))

      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(id)
    })
  })
})
