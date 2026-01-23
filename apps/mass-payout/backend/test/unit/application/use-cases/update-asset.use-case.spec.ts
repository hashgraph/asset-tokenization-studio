// SPDX-License-Identifier: Apache-2.0

import { UpdateAssetUseCase } from "@application/use-cases/update-asset.use-case"
import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { UpdateAssetDomainService } from "@domain/services/update-asset.domain-service"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress } from "@test/shared/utils"

describe(UpdateAssetUseCase.name, () => {
  let updateAssetUseCase: UpdateAssetUseCase
  const updateAssetDomainServiceMock = createMock<UpdateAssetDomainService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAssetUseCase,
        {
          provide: UpdateAssetDomainService,
          useValue: updateAssetDomainServiceMock,
        },
      ],
    }).compile()

    updateAssetUseCase = module.get<UpdateAssetUseCase>(UpdateAssetUseCase)
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

      updateAssetDomainServiceMock.updateAsset.mockResolvedValue(expectedAsset)

      const result = await updateAssetUseCase.execute(id, name)

      expect(updateAssetDomainServiceMock.updateAsset).toHaveBeenCalledWith(id, name)
      expect(result).toBe(expectedAsset)
    })
  })
})
