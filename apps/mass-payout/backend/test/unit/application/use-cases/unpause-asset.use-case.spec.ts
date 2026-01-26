// SPDX-License-Identifier: Apache-2.0

import { UnpauseAssetUseCase } from "@application/use-cases/unpause-asset.use-case"
import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { UnpauseAssetDomainService } from "@domain/services/unpause-asset.domain-service"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress } from "@test/shared/utils"

describe(UnpauseAssetUseCase.name, () => {
  let unpauseAssetUseCase: UnpauseAssetUseCase
  const unpauseAssetDomainServiceMock = createMock<UnpauseAssetDomainService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnpauseAssetUseCase,
        {
          provide: UnpauseAssetDomainService,
          useValue: unpauseAssetDomainServiceMock,
        },
      ],
    }).compile()

    unpauseAssetUseCase = module.get<UnpauseAssetUseCase>(UnpauseAssetUseCase)

    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should call domain service with correct parameters and return the result", async () => {
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

      unpauseAssetDomainServiceMock.unpause.mockResolvedValue(expectedAsset)

      const result = await unpauseAssetUseCase.execute(id)

      expect(unpauseAssetDomainServiceMock.unpause).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedAsset)
    })
  })
})
