// SPDX-License-Identifier: Apache-2.0

import { GetAssetDistributionsUseCase } from "@application/use-cases/get-asset-distributions.use-case"
import { Distribution } from "@domain/model/distribution"
import { OrderPageOptions, Page, PageOptions } from "@domain/model/page"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { DistributionUtils } from "@test/shared/distribution.utils"

describe(GetAssetDistributionsUseCase.name, () => {
  let getAssetDistributionsUseCase: GetAssetDistributionsUseCase
  const distributionRepositoryMock = createMock<DistributionRepository>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAssetDistributionsUseCase,
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
      ],
    }).compile()

    getAssetDistributionsUseCase = module.get<GetAssetDistributionsUseCase>(GetAssetDistributionsUseCase)
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should return paginated distributions when distributions exist", async () => {
      // Given
      const assetId = faker.string.uuid()
      const distribution1 = DistributionUtils.newInstance()
      const distribution2 = DistributionUtils.newInstance()

      const expectedPage: Page<Distribution> = {
        items: [distribution1, distribution2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      distributionRepositoryMock.getDistributionsByAssetId.mockResolvedValue(expectedPage)

      // When
      const result = await getAssetDistributionsUseCase.execute(assetId, PageOptions.DEFAULT)

      // Then
      expect(distributionRepositoryMock.getDistributionsByAssetId).toHaveBeenCalledWith(assetId, PageOptions.DEFAULT)
      expect(result).toEqual(expectedPage)
      expect(result.items).toHaveLength(2)
    })

    it("should return empty page when no distributions exist", async () => {
      // Given
      const assetId = faker.string.uuid()
      const emptyPage: Page<Distribution> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      distributionRepositoryMock.getDistributionsByAssetId.mockResolvedValue(emptyPage)

      // When
      const result = await getAssetDistributionsUseCase.execute(assetId)

      // Then
      expect(distributionRepositoryMock.getDistributionsByAssetId).toHaveBeenCalledWith(assetId, PageOptions.DEFAULT)
      expect(result).toEqual(emptyPage)
      expect(result.items).toHaveLength(0)
    })

    it("should use custom pagination options when provided", async () => {
      // Given
      const assetId = faker.string.uuid()
      const customPageOptions = { page: 2, limit: 5, order: OrderPageOptions.DEFAULT }
      const distribution = DistributionUtils.newInstance()

      const expectedPage: Page<Distribution> = {
        items: [distribution],
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      }

      distributionRepositoryMock.getDistributionsByAssetId.mockResolvedValue(expectedPage)

      // When
      const result = await getAssetDistributionsUseCase.execute(assetId, customPageOptions)

      // Then
      expect(distributionRepositoryMock.getDistributionsByAssetId).toHaveBeenCalledWith(assetId, customPageOptions)
      expect(result).toEqual(expectedPage)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(5)
    })

    it("should use default pagination when no options provided", async () => {
      // Given
      const assetId = faker.string.uuid()
      const defaultPage: Page<Distribution> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      distributionRepositoryMock.getDistributionsByAssetId.mockResolvedValue(defaultPage)

      // When
      const result = await getAssetDistributionsUseCase.execute(assetId)

      // Then
      expect(distributionRepositoryMock.getDistributionsByAssetId).toHaveBeenCalledWith(assetId, PageOptions.DEFAULT)
      expect(result).toEqual(defaultPage)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })
  })
})
