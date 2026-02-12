// SPDX-License-Identifier: Apache-2.0

import { ImportAssetUseCase } from "@application/use-cases/import-asset.use-case"
import {
  AssetEvmTokenAddressInvalidError,
  AssetHederaTokenAddressInvalidError,
  AssetLifeCycleCashFlowEvmAddressInvalidError,
  AssetLifeCycleCashFlowHederaAddressInvalidError,
  AssetNameMissingError,
} from "@domain/errors/asset.error"
import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { ImportAssetDomainService } from "@domain/services/import-asset.domain-service"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress, fakeLifeCycleCashFlowAddress } from "@test/shared/utils"

describe(ImportAssetUseCase.name, () => {
  let importAssetUseCase: ImportAssetUseCase
  const importAssetDomainServiceMock = createMock<ImportAssetDomainService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportAssetUseCase,
        {
          provide: ImportAssetDomainService,
          useValue: importAssetDomainServiceMock,
        },
      ],
    }).compile()

    importAssetUseCase = module.get<ImportAssetUseCase>(ImportAssetUseCase)
  })

  describe("execute", () => {
    it("should call domain service with correct parameters and return the result", async () => {
      const name = faker.commerce.productName()
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const lifeCycleCashFlowAddress = fakeLifeCycleCashFlowAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const expectedAsset = new Asset(
        faker.string.uuid(),
        name,
        AssetType.EQUITY,
        hederaTokenAddress,
        evmTokenAddress,
        symbol,
        undefined,
        lifeCycleCashFlowAddress.hederaAddress,
        lifeCycleCashFlowAddress.evmAddress,
        false,
        true,
        new Date(),
        new Date(),
      )

      importAssetDomainServiceMock.importAsset.mockResolvedValue(expectedAsset)

      const result = await importAssetUseCase.execute(hederaTokenAddress)

      expect(importAssetDomainServiceMock.importAsset).toHaveBeenCalledWith(hederaTokenAddress)
      expect(result).toBe(expectedAsset)
    })

    it("should throw error when name is empty", async () => {
      try {
        const symbol = faker.string.alpha({ length: 3 })
        Asset.create(undefined, AssetType.EQUITY, fakeHederaAddress(), faker.finance.ethereumAddress(), symbol)
      } catch (error) {
        expect(error).toBeInstanceOf(AssetNameMissingError)
      }
    })

    it("should throw error when hederaTokenAddress is not in format 0.0.X", async () => {
      try {
        const symbol = faker.string.alpha({ length: 3 })
        Asset.create(
          faker.commerce.productName(),
          AssetType.EQUITY,
          fakeHederaAddress(),
          faker.finance.ethereumAddress(),
          symbol,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(AssetHederaTokenAddressInvalidError)
      }
    })

    it("should throw error when evmTokenAddress is not a valid Ethereum address", async () => {
      try {
        const symbol = faker.string.alpha({ length: 3 })
        const maturityDate = faker.date.future()
        Asset.create(
          faker.commerce.productName(),
          AssetType.BOND_VARIABLE_RATE,
          fakeHederaAddress(),
          faker.finance.ethereumAddress(),
          symbol,
          maturityDate,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(AssetEvmTokenAddressInvalidError)
      }
    })

    it("should throw error when lifeCycleCashFlowHederaAddress is not in format 0.0.X", async () => {
      try {
        const symbol = faker.string.alpha({ length: 3 })
        const maturityDate = faker.date.future()
        Asset.create(
          faker.commerce.productName(),
          AssetType.BOND_VARIABLE_RATE,
          fakeHederaAddress(),
          faker.finance.ethereumAddress(),
          symbol,
          maturityDate,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(AssetLifeCycleCashFlowHederaAddressInvalidError)
      }
    })

    it("should throw error when lifeCycleCashFlowEvmAddress is not a valid Ethereum address", async () => {
      try {
        const symbol = faker.string.alpha({ length: 3 })
        const maturityDate = faker.date.future()
        Asset.create(
          faker.commerce.productName(),
          AssetType.BOND_VARIABLE_RATE,
          fakeHederaAddress(),
          faker.finance.ethereumAddress(),
          symbol,
          maturityDate,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(AssetLifeCycleCashFlowEvmAddressInvalidError)
      }
    })
  })
})
