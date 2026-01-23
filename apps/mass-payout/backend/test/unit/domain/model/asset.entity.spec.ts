// SPDX-License-Identifier: Apache-2.0

import {
  AssetEvmTokenAddressInvalidError,
  AssetHederaTokenAddressInvalidError,
  AssetLifeCycleCashFlowEvmAddressInvalidError,
  AssetLifeCycleCashFlowHederaAddressInvalidError,
  AssetNameMissingError,
} from "@domain/errors/asset.error"
import { BaseEntityInvalidDatesError } from "@domain/errors/shared/base-entity-invalid-dates.error"
import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { LifeCycleCashFlowAddress } from "@domain/model/life-cycle-cash-flow-address.value-object"
import { faker } from "@faker-js/faker"
import { AssetUtils } from "@test/shared/asset.utils"
import { fakeHederaAddress, fakeLifeCycleCashFlowAddress } from "@test/shared/utils"

describe(Asset.name, () => {
  describe("create", () => {
    it("should create an Asset", () => {
      const name = faker.string.alphanumeric()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const asset = AssetUtils.newInstance({ name, type, hederaTokenAddress, evmTokenAddress })

      expect(asset).toBeInstanceOf(Asset)
      expect(asset.id).toBeDefined()
      expect(asset.name).toBe(name)
      expect(asset.type).toBe(type)
      expect(asset.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(asset.evmTokenAddress).toBe(evmTokenAddress)
    })

    it("should create an Asset with BOND type", () => {
      const name = faker.string.alphanumeric()
      const type = AssetType.BOND
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const asset = AssetUtils.newInstance({ name, type, hederaTokenAddress, evmTokenAddress })

      expect(asset).toBeInstanceOf(Asset)
      expect(asset.id).toBeDefined()
      expect(asset.name).toBe(name)
      expect(asset.type).toBe(type)
      expect(asset.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(asset.evmTokenAddress).toBe(evmTokenAddress)
    })

    it("should create an Asset with isPaused set to true if specified", () => {
      const name = faker.string.alphanumeric()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const isPaused = true

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, type, hederaTokenAddress, evmTokenAddress, symbol, undefined, isPaused)

      expect(asset).toBeInstanceOf(Asset)
      expect(asset.id).toBeDefined()
      expect(asset.name).toBe(name)
      expect(asset.type).toBe(type)
      expect(asset.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(asset.evmTokenAddress).toBe(evmTokenAddress)
      expect(asset.isPaused).toBe(true)
    })

    it("fails when name is empty, null or undefined", () => {
      const invalidNames = ["   ", "", null, undefined] as unknown[]
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      invalidNames.forEach((invalidName) => {
        expect(() => {
          const symbol = faker.string.alpha({ length: 3 })
          Asset.create(invalidName as string, type, hederaTokenAddress, evmTokenAddress, symbol)
        }).toThrow(AssetNameMissingError)
      })
    })

    it("fails when hederaTokenAddress is not in format 0.0.X", () => {
      const name = faker.finance.currencyName()
      const type = AssetType.EQUITY
      const invalidHederaTokenAddresses = ["1.2", "a.b.c", "0.0", faker.string.uuid()]
      const evmTokenAddress = faker.finance.ethereumAddress()

      invalidHederaTokenAddresses.forEach((invalidHederaTokenAddress) => {
        let error: Error
        try {
          const symbol = faker.string.alpha({ length: 3 })
          Asset.create(name, type, invalidHederaTokenAddress, evmTokenAddress, symbol)
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(AssetHederaTokenAddressInvalidError)
      })
    })

    it("fails when evmTokenAddress is not a valid Ethereum address", () => {
      const name = faker.finance.currencyName()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const invalidEvmTokenAddresses = ["1.2", "a.b.c", "0.0", "0xInvalidEthereumAddress"]

      invalidEvmTokenAddresses.forEach((invalidEvmTokenAddress) => {
        let error: Error
        try {
          const symbol = faker.string.alpha({ length: 3 })
          Asset.create(name, type, hederaTokenAddress, invalidEvmTokenAddress, symbol)
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(AssetEvmTokenAddressInvalidError)
      })
    })
  })

  describe("createExisting", () => {
    it("should recreate an Asset with all provided valid data", () => {
      const id = faker.string.uuid()
      const name = faker.finance.currencyName()
      const type = AssetType.BOND
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const hederaLifeCycleCashFlowAddress = fakeHederaAddress()
      const evmLifeCycleCashFlowAddress = faker.finance.ethereumAddress()
      const isPaused = false
      const syncEnabled = true
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      const symbol = faker.string.alpha({ length: 3 })
      const maturityDate = type === AssetType.BOND ? faker.date.future() : undefined
      const asset = Asset.createExisting(
        id,
        name,
        type,
        hederaTokenAddress,
        evmTokenAddress,
        symbol,
        maturityDate,
        hederaLifeCycleCashFlowAddress,
        evmLifeCycleCashFlowAddress,
        isPaused,
        syncEnabled,
        createdAt,
        updatedAt,
      )

      expect(asset).toBeInstanceOf(Asset)
      expect(asset.id).toBe(id)
      expect(asset.name).toBe(name)
      expect(asset.type).toBe(type)
      expect(asset.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(asset.evmTokenAddress).toBe(evmTokenAddress)
      expect(asset.lifeCycleCashFlowHederaAddress).toBe(hederaLifeCycleCashFlowAddress)
      expect(asset.lifeCycleCashFlowEvmAddress).toBe(evmLifeCycleCashFlowAddress)
      expect(asset.isPaused).toBe(isPaused)
      expect(asset.syncEnabled).toBe(syncEnabled)
      expect(asset.createdAt).toBe(createdAt)
      expect(asset.updatedAt).toBe(updatedAt)
    })

    it("fails when name is empty, null or undefined for existing asset", () => {
      const id = faker.string.uuid()
      const invalidNames = ["   ", "", null, undefined] as unknown[]
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const hederaLifeCycleCashFlowAddress = fakeHederaAddress()
      const evmLifeCycleCashFlowAddress = faker.finance.ethereumAddress()
      const isPaused = false
      const syncEnabled = true
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      invalidNames.forEach((invalidName) => {
        let error: Error
        try {
          const symbol = faker.string.alpha({ length: 3 })
          Asset.createExisting(
            id,
            invalidName as string,
            type,
            hederaTokenAddress,
            evmTokenAddress,
            symbol,
            undefined,
            hederaLifeCycleCashFlowAddress,
            evmLifeCycleCashFlowAddress,
            isPaused,
            syncEnabled,
            createdAt,
            updatedAt,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(AssetNameMissingError)
      })
    })

    it("fails when hederaTokenAddress is not in format 0.0.X for existing asset", () => {
      const id = faker.string.uuid()
      const name = faker.finance.currencyName()
      const type = AssetType.EQUITY
      const invalidHederaTokenAddresses = ["1.2", "a.b.c", "0.0", faker.string.uuid()]
      const evmTokenAddress = faker.finance.ethereumAddress()
      const hederaLifeCycleCashFlowAddress = fakeHederaAddress()
      const evmLifeCycleCashFlowAddress = faker.finance.ethereumAddress()
      const isPaused = false
      const syncEnabled = true
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      invalidHederaTokenAddresses.forEach((invalidHederaTokenAddress) => {
        let error: Error
        try {
          const symbol = faker.string.alpha({ length: 3 })
          Asset.createExisting(
            id,
            name,
            type,
            invalidHederaTokenAddress,
            evmTokenAddress,
            symbol,
            undefined,
            hederaLifeCycleCashFlowAddress,
            evmLifeCycleCashFlowAddress,
            isPaused,
            syncEnabled,
            createdAt,
            updatedAt,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(AssetHederaTokenAddressInvalidError)
      })
    })

    it("fails when evmTokenAddress is not a valid Ethereum address for existing asset", () => {
      const id = faker.string.uuid()
      const name = faker.finance.currencyName()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const hederaLifeCycleCashFlowAddress = fakeHederaAddress()
      const isPaused = false
      const syncEnabled = true
      const evmLifeCycleCashFlowAddress = faker.finance.ethereumAddress()
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const invalidEvmTokenAddresses = ["1.2", "a.b.c", "0.0", "0xInvalidEthereumAddress"]

      invalidEvmTokenAddresses.forEach((invalidEvmTokenAddress) => {
        let error: Error
        try {
          const symbol = faker.string.alpha({ length: 3 })
          Asset.createExisting(
            id,
            name,
            type,
            hederaTokenAddress,
            invalidEvmTokenAddress,
            symbol,
            undefined,
            hederaLifeCycleCashFlowAddress,
            evmLifeCycleCashFlowAddress,
            isPaused,
            syncEnabled,
            createdAt,
            updatedAt,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(AssetEvmTokenAddressInvalidError)
      })
    })

    it("should fail if createdAt is after updatedAt when recreating from existing data", () => {
      const id = faker.string.uuid()
      const name = faker.finance.currencyName()
      const type = AssetType.BOND
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const hederaLifeCycleCashFlowAddress = fakeHederaAddress()
      const isPaused = false
      const syncEnabled = true
      const evmLifeCycleCashFlowAddress = faker.finance.ethereumAddress()
      const createdAt = faker.date.future()
      const updatedAt = faker.date.past()
      let error: Error

      try {
        const symbol = faker.string.alpha({ length: 3 })
        const maturityDate = type === AssetType.BOND ? faker.date.future() : undefined
        Asset.createExisting(
          id,
          name,
          type,
          hederaTokenAddress,
          evmTokenAddress,
          symbol,
          maturityDate,
          hederaLifeCycleCashFlowAddress,
          evmLifeCycleCashFlowAddress,
          isPaused,
          syncEnabled,
          createdAt,
          updatedAt,
        )
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(BaseEntityInvalidDatesError)
    })

    it("should fail if lifeCycleCashFlowHederaAddress is not in format 0.0.X", () => {
      const wrongLifeCycleCashFlowHederaAddress = "0.0.WrongAddress"
      const name = faker.string.alphanumeric()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const isPaused = false
      const syncEnabled = true
      const lifeCycleCashFlowEvmAddress = faker.finance.ethereumAddress()
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      expect(() => {
        const symbol = faker.string.alpha({ length: 3 })
        Asset.createExisting(
          faker.string.uuid(),
          name,
          type,
          hederaTokenAddress,
          evmTokenAddress,
          symbol,
          undefined,
          wrongLifeCycleCashFlowHederaAddress,
          lifeCycleCashFlowEvmAddress,
          isPaused,
          syncEnabled,
          createdAt,
          updatedAt,
        )
      }).toThrow(AssetLifeCycleCashFlowHederaAddressInvalidError)
    })

    it("should fail if lifeCycleCashFlowEvmAddress is not a valid Ethereum address", () => {
      const wrongLifeCycleCashFlowEvmAddress = "0xWrongAddress"
      const name = faker.string.alphanumeric()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const isPaused = false
      const syncEnabled = true
      const lifeCycleCashFlowHederaAddress = fakeHederaAddress()
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      expect(() => {
        const symbol = faker.string.alpha({ length: 3 })
        Asset.createExisting(
          faker.string.uuid(),
          name,
          type,
          hederaTokenAddress,
          evmTokenAddress,
          symbol,
          undefined,
          lifeCycleCashFlowHederaAddress,
          wrongLifeCycleCashFlowEvmAddress,
          isPaused,
          syncEnabled,
          createdAt,
          updatedAt,
        )
      }).toThrow(AssetLifeCycleCashFlowEvmAddressInvalidError)
    })
  })

  describe("withLifeCycleCashFlow", () => {
    it("should add lifeCycleCashFlow addresses to an existing asset", () => {
      const name = faker.string.alphanumeric()
      const type = AssetType.BOND
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const asset = AssetUtils.newInstance({ name, type, hederaTokenAddress, evmTokenAddress })

      const lifeCycleCashFlowAddress = fakeLifeCycleCashFlowAddress()
      const hederaLifeCycleCashFlowAddress = lifeCycleCashFlowAddress.hederaAddress
      const evmLifeCycleCashFlowAddress = lifeCycleCashFlowAddress.evmAddress

      expect(asset.lifeCycleCashFlowHederaAddress).toBeUndefined()
      expect(asset.lifeCycleCashFlowEvmAddress).toBeUndefined()

      const assetWithLifeCycleCashFlow = asset.withLifeCycleCashFlow(lifeCycleCashFlowAddress)

      expect(assetWithLifeCycleCashFlow).toBeInstanceOf(Asset)
      expect(assetWithLifeCycleCashFlow.id).toBe(asset.id)
      expect(assetWithLifeCycleCashFlow.name).toBe(name)
      expect(assetWithLifeCycleCashFlow.type).toBe(type)
      expect(assetWithLifeCycleCashFlow.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(assetWithLifeCycleCashFlow.evmTokenAddress).toBe(evmTokenAddress)
      expect(assetWithLifeCycleCashFlow.lifeCycleCashFlowHederaAddress).toBe(hederaLifeCycleCashFlowAddress)
      expect(assetWithLifeCycleCashFlow.lifeCycleCashFlowEvmAddress).toBe(evmLifeCycleCashFlowAddress)
      expect(assetWithLifeCycleCashFlow.createdAt).toBe(asset.createdAt)
    })

    it("should validate lifeCycleCashFlow addresses format", () => {
      const invalidHederaAddress = "invalid-address"
      const invalidEvmAddress = "invalid-ethereum-address"
      const validEvmAddress = faker.finance.ethereumAddress()
      const validHederaAddress = fakeHederaAddress()

      expect(() => {
        LifeCycleCashFlowAddress.create(invalidHederaAddress, validEvmAddress)
      }).toThrow(AssetLifeCycleCashFlowHederaAddressInvalidError)

      expect(() => {
        LifeCycleCashFlowAddress.create(validHederaAddress, invalidEvmAddress)
      }).toThrow(AssetLifeCycleCashFlowEvmAddressInvalidError)
    })
  })

  describe("withName", () => {
    it("should create a new instance with updated name", () => {
      const name = faker.company.name()
      const newName = faker.company.name()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, type, hederaTokenAddress, evmTokenAddress, symbol)
      expect(asset.name).toBe(name)

      const updatedAsset = asset.withName(newName)

      expect(updatedAsset).toBeInstanceOf(Asset)
      expect(updatedAsset.id).toBe(asset.id)
      expect(updatedAsset.name).toBe(newName)
      expect(updatedAsset.type).toBe(type)
      expect(updatedAsset.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(updatedAsset.evmTokenAddress).toBe(evmTokenAddress)
      expect(updatedAsset.lifeCycleCashFlowHederaAddress).toBeUndefined()
      expect(updatedAsset.lifeCycleCashFlowEvmAddress).toBeUndefined()
      expect(updatedAsset.createdAt).toBe(asset.createdAt)
      expect(updatedAsset.updatedAt).not.toBe(asset.updatedAt)
    })

    it("should validate the new name", () => {
      const name = faker.company.name()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, type, hederaTokenAddress, evmTokenAddress, symbol)

      expect(() => {
        asset.withName("")
      }).toThrow(AssetNameMissingError)

      expect(() => {
        asset.withName("   ")
      }).toThrow(AssetNameMissingError)
    })
  })

  describe("withType", () => {
    it("should create a new instance with updated type", () => {
      const name = faker.company.name()
      const originalType = AssetType.EQUITY
      const newType = AssetType.BOND
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, originalType, hederaTokenAddress, evmTokenAddress, symbol)
      expect(asset.type).toBe(originalType)

      const updatedAsset = asset.withType(newType)

      expect(updatedAsset).toBeInstanceOf(Asset)
      expect(updatedAsset.id).toBe(asset.id)
      expect(updatedAsset.name).toBe(name)
      expect(updatedAsset.type).toBe(newType)
      expect(updatedAsset.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(updatedAsset.evmTokenAddress).toBe(evmTokenAddress)
      expect(updatedAsset.lifeCycleCashFlowHederaAddress).toBeUndefined()
      expect(updatedAsset.lifeCycleCashFlowEvmAddress).toBeUndefined()
      expect(updatedAsset.createdAt).toBe(asset.createdAt)
      expect(updatedAsset.updatedAt).not.toBe(asset.updatedAt)
    })

    it("should preserve lifecycle cash flow addresses when updating type", () => {
      const name = faker.company.name()
      const originalType = AssetType.EQUITY
      const newType = AssetType.BOND
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, originalType, hederaTokenAddress, evmTokenAddress, symbol)
      const lifeCycleCashFlowAddress = fakeLifeCycleCashFlowAddress()
      const assetWithLifeCycle = asset.withLifeCycleCashFlow(lifeCycleCashFlowAddress)

      const updatedAsset = assetWithLifeCycle.withType(newType)

      expect(updatedAsset.type).toBe(newType)
      expect(updatedAsset.lifeCycleCashFlowHederaAddress).toBe(lifeCycleCashFlowAddress.hederaAddress)
      expect(updatedAsset.lifeCycleCashFlowEvmAddress).toBe(lifeCycleCashFlowAddress.evmAddress)
    })
  })

  describe("pause and unpause", () => {
    it("should create a new instance with isPaused set to true when paused", () => {
      const name = faker.company.name()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, type, hederaTokenAddress, evmTokenAddress, symbol)
      expect(asset.isPaused).toBe(false)

      const pausedAsset = asset.pause()

      expect(pausedAsset).toBeInstanceOf(Asset)
      expect(pausedAsset.id).toBe(asset.id)
      expect(pausedAsset.name).toBe(name)
      expect(pausedAsset.type).toBe(type)
      expect(pausedAsset.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(pausedAsset.evmTokenAddress).toBe(evmTokenAddress)
      expect(pausedAsset.lifeCycleCashFlowHederaAddress).toBeUndefined()
      expect(pausedAsset.lifeCycleCashFlowEvmAddress).toBeUndefined()
      expect(pausedAsset.isPaused).toBe(true)
      expect(pausedAsset.createdAt).toBe(asset.createdAt)
      expect(pausedAsset.updatedAt).not.toBe(asset.updatedAt)
    })

    it("should create a new instance with isPaused set to false when unpaused", () => {
      const name = faker.company.name()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, type, hederaTokenAddress, evmTokenAddress, symbol)
      const pausedAsset = asset.pause()
      expect(pausedAsset.isPaused).toBe(true)

      const unpausedAsset = pausedAsset.unpause()

      expect(unpausedAsset).toBeInstanceOf(Asset)
      expect(unpausedAsset.id).toBe(asset.id)
      expect(unpausedAsset.name).toBe(name)
      expect(unpausedAsset.type).toBe(type)
      expect(unpausedAsset.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(unpausedAsset.evmTokenAddress).toBe(evmTokenAddress)
      expect(unpausedAsset.lifeCycleCashFlowHederaAddress).toBeUndefined()
      expect(unpausedAsset.lifeCycleCashFlowEvmAddress).toBeUndefined()
      expect(unpausedAsset.isPaused).toBe(false)
      expect(unpausedAsset.createdAt).toBe(asset.createdAt)
      expect(unpausedAsset.updatedAt).not.toBe(pausedAsset.updatedAt)
    })

    it("should preserve lifecycle cash flow addresses when pausing and unpausing", () => {
      const name = faker.company.name()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, type, hederaTokenAddress, evmTokenAddress, symbol)
      const lifeCycleCashFlowAddress = fakeLifeCycleCashFlowAddress()
      const assetWithLifeCycle = asset.withLifeCycleCashFlow(lifeCycleCashFlowAddress)

      const pausedAsset = assetWithLifeCycle.pause()
      expect(pausedAsset.isPaused).toBe(true)
      expect(pausedAsset.lifeCycleCashFlowHederaAddress).toBe(lifeCycleCashFlowAddress.hederaAddress)
      expect(pausedAsset.lifeCycleCashFlowEvmAddress).toBe(lifeCycleCashFlowAddress.evmAddress)

      const unpausedAsset = pausedAsset.unpause()
      expect(unpausedAsset.isPaused).toBe(false)
      expect(unpausedAsset.lifeCycleCashFlowHederaAddress).toBe(lifeCycleCashFlowAddress.hederaAddress)
      expect(unpausedAsset.lifeCycleCashFlowEvmAddress).toBe(lifeCycleCashFlowAddress.evmAddress)
    })

    it("should create asset with isPaused false by default", () => {
      const name = faker.string.alphanumeric()
      const type = AssetType.EQUITY
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, type, hederaTokenAddress, evmTokenAddress, symbol)

      expect(asset.isPaused).toBe(false)
    })

    it("should allow multiple pause/unpause operations", () => {
      const name = faker.company.name()
      const type = AssetType.BOND
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()

      const symbol = faker.string.alpha({ length: 3 })
      const asset = Asset.create(name, type, hederaTokenAddress, evmTokenAddress, symbol)

      const pausedOnce = asset.pause()
      expect(pausedOnce.isPaused).toBe(true)

      const pausedTwice = pausedOnce.pause()
      expect(pausedTwice.isPaused).toBe(true)

      const unpausedOnce = pausedTwice.unpause()
      expect(unpausedOnce.isPaused).toBe(false)

      const unpausedTwice = unpausedOnce.unpause()
      expect(unpausedTwice.isPaused).toBe(false)
    })

    it("should recreate existing asset with isPaused state", () => {
      const id = faker.string.uuid()
      const name = faker.finance.currencyName()
      const type = AssetType.BOND
      const hederaTokenAddress = fakeHederaAddress()
      const evmTokenAddress = faker.finance.ethereumAddress()
      const hederaLifeCycleCashFlowAddress = fakeHederaAddress()
      const evmLifeCycleCashFlowAddress = faker.finance.ethereumAddress()
      const isPaused = true
      const syncEnabled = false
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      const symbol = faker.string.alpha({ length: 3 })
      const maturityDate = type === AssetType.BOND ? faker.date.future() : undefined
      const asset = Asset.createExisting(
        id,
        name,
        type,
        hederaTokenAddress,
        evmTokenAddress,
        symbol,
        maturityDate,
        hederaLifeCycleCashFlowAddress,
        evmLifeCycleCashFlowAddress,
        isPaused,
        syncEnabled,
        createdAt,
        updatedAt,
      )

      expect(asset.isPaused).toBe(true)
      expect(asset.id).toBe(id)
      expect(asset.name).toBe(name)
    })
  })
})
