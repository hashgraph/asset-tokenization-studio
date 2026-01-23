// SPDX-License-Identifier: Apache-2.0

import { GetAssetsUseCase } from "@application/use-cases/get-assets.use-case"
import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { OrderPageOptions, Page, PageOptions } from "@domain/model/page"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress } from "@test/shared/utils"

describe(GetAssetsUseCase.name, () => {
  let getAssetsUseCase: GetAssetsUseCase
  const assetRepositoryMock = createMock<AssetRepository>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAssetsUseCase,
        {
          provide: "AssetRepository",
          useValue: assetRepositoryMock,
        },
      ],
    }).compile()

    getAssetsUseCase = module.get<GetAssetsUseCase>(GetAssetsUseCase)

    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should return paginated assets when assets exist", async () => {
      const symbol1 = faker.string.alpha({ length: 3 })
      const asset1 = new Asset(
        faker.string.uuid(),
        faker.commerce.productName(),
        AssetType.EQUITY,
        fakeHederaAddress(),
        faker.finance.ethereumAddress(),
        symbol1,
        undefined,
        undefined,
        undefined,
        false,
        true,
        new Date(),
        new Date(),
      )

      const symbol2 = faker.string.alpha({ length: 3 })
      const asset2 = new Asset(
        faker.string.uuid(),
        faker.commerce.productName(),
        AssetType.EQUITY,
        fakeHederaAddress(),
        faker.finance.ethereumAddress(),
        symbol2,
        undefined,
        undefined,
        undefined,
        true,
        true,
        new Date(),
        new Date(),
      )

      const expectedPage: Page<Asset> = {
        items: [asset1, asset2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      assetRepositoryMock.getAssets.mockResolvedValue(expectedPage)

      const result = await getAssetsUseCase.execute(PageOptions.DEFAULT)

      expect(assetRepositoryMock.getAssets).toHaveBeenCalledWith(PageOptions.DEFAULT)
      expect(result).toEqual(expectedPage)
      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.totalPages).toBe(1)
    })

    it("should return empty page when no assets exist", async () => {
      const emptyPage: Page<Asset> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      assetRepositoryMock.getAssets.mockResolvedValue(emptyPage)

      const result = await getAssetsUseCase.execute(PageOptions.DEFAULT)

      expect(assetRepositoryMock.getAssets).toHaveBeenCalledWith(PageOptions.DEFAULT)
      expect(result).toEqual(emptyPage)
      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })

    it("should use default pagination when no options provided", async () => {
      // Given
      const defaultPage: Page<Asset> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }
      assetRepositoryMock.getAssets.mockResolvedValue(defaultPage)

      // When
      const result = await getAssetsUseCase.execute()

      // Then
      expect(assetRepositoryMock.getAssets).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        order: OrderPageOptions.DEFAULT,
      })
      expect(result).toEqual(defaultPage)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })

    it("should use custom pagination options when provided", async () => {
      const customPage: Page<Asset> = {
        items: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      }

      assetRepositoryMock.getAssets.mockResolvedValue(customPage)

      const result = await getAssetsUseCase.execute({
        page: 2,
        limit: 5,
        order: OrderPageOptions.DEFAULT,
      })

      expect(assetRepositoryMock.getAssets).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        order: OrderPageOptions.DEFAULT,
      })
      expect(result).toEqual(customPage)
    })
  })
})
