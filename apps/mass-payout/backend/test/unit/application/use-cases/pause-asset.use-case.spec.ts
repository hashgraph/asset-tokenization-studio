// SPDX-License-Identifier: Apache-2.0

import { PauseAssetUseCase } from "@application/use-cases/pause-asset.use-case"
import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { PauseAssetDomainService } from "@domain/services/pause-asset.domain-service"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress } from "@test/shared/utils"

describe(PauseAssetUseCase.name, () => {
  let pauseAssetUseCase: PauseAssetUseCase
  const pauseAssetDomainServiceMock = createMock<PauseAssetDomainService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PauseAssetUseCase,
        {
          provide: PauseAssetDomainService,
          useValue: pauseAssetDomainServiceMock,
        },
      ],
    }).compile()

    pauseAssetUseCase = module.get<PauseAssetUseCase>(PauseAssetUseCase)

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
        true,
        true,
        new Date(),
        new Date(),
      )

      pauseAssetDomainServiceMock.pause.mockResolvedValue(expectedAsset)

      const result = await pauseAssetUseCase.execute(id)

      expect(pauseAssetDomainServiceMock.pause).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedAsset)
    })
  })
})
