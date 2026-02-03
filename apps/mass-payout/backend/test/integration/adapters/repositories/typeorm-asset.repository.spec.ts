// SPDX-License-Identifier: Apache-2.0

import { ConfigurationModule } from "@config/configuration.module"
import { ENTITIES, PostgresModule } from "@config/postgres.module"
import { CustomError } from "@domain/errors/shared/custom.error"
import { OrderPageOptions } from "@domain/model/page"
import { AssetRepositoryError } from "@infrastructure/adapters/repositories/errors/asset.repository.error"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { AssetTypeOrmRepository } from "@infrastructure/adapters/repositories/typeorm-asset.repository"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { AssetUtils } from "@test/shared/asset.utils"
import { PostgreSqlContainer } from "@test/shared/containers/postgresql-container"
import { fakeLifeCycleCashFlowAddress, TestConstants } from "@test/shared/utils"
import crypto from "crypto"
import { Repository } from "typeorm"

// https://www.postgresql.org/docs/current/errcodes-appendix.html
export const PG_SQLSTATE_UNIQUE_VIOLATION = "23505"

describe(AssetTypeOrmRepository.name, () => {
  let assetRepository: AssetTypeOrmRepository
  let internalAssetRepository: Repository<AssetPersistence>
  let container: PostgreSqlContainer

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigurationModule.forRoot("/.env.test"), PostgresModule.forRoot(container.getConfig(), ENTITIES)],
      providers: [AssetTypeOrmRepository],
    }).compile()

    assetRepository = module.get<AssetTypeOrmRepository>(AssetTypeOrmRepository)
    internalAssetRepository = module.get<Repository<AssetPersistence>>(getRepositoryToken(AssetPersistence))
  }, TestConstants.BEFORE_ALL_TIMEOUT)

  afterAll(async () => {
    await container.stop()
  }, TestConstants.AFTER_ALL_TIMEOUT)

  afterEach(async () => {
    const assets = await internalAssetRepository.find()
    await internalAssetRepository.remove(assets)
  })

  describe("saveAsset", () => {
    it("should save an asset successfully", async () => {
      const asset = AssetUtils.newInstanceWithLifeCycleCashFlow()
      await expect(assetRepository.saveAsset(asset)).resolves.toEqual(asset)
    })

    it("should throw error if database error happens", async () => {
      const asset = AssetUtils.newInstance()
      const databaseError = new Error("Database error")

      jest.spyOn(internalAssetRepository, "insert").mockImplementationOnce(() => {
        throw databaseError
      })

      let thrownError: CustomError
      try {
        await assetRepository.saveAsset(asset)
      } catch (error) {
        thrownError = error
      }

      expect(thrownError).toBeInstanceOf(AssetRepositoryError)
      expect(thrownError.originalError).toBe(databaseError)
      expect(thrownError.message).toBe(AssetRepositoryError.ERRORS.SAVE_ASSET(asset))
    })
  })

  describe("updateAsset", () => {
    it("should update an asset successfully", async () => {
      const asset = AssetUtils.newInstance()
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset))

      const initialSaved = await internalAssetRepository.findOne({ where: { id: asset.id } })
      expect(initialSaved.lifeCycleCashFlowHederaAddress).toBeNull()
      expect(initialSaved.lifeCycleCashFlowEvmAddress).toBeNull()
      const lifeCycleCashFlowAddress = fakeLifeCycleCashFlowAddress()
      const assetWithLifeCycleCashFlow = asset.withLifeCycleCashFlow(lifeCycleCashFlowAddress)

      await expect(assetRepository.updateAsset(assetWithLifeCycleCashFlow)).resolves.toEqual(assetWithLifeCycleCashFlow)

      const foundAsset = await assetRepository.getAsset(asset.id)
      expect(foundAsset).toEqual(assetWithLifeCycleCashFlow)
    })

    it("should throw error if database error happens", async () => {
      const asset = AssetUtils.newInstance()
      const databaseError = new Error("Database error")

      jest.spyOn(internalAssetRepository, "update").mockImplementationOnce(() => {
        throw databaseError
      })

      let thrownError: CustomError
      try {
        await assetRepository.updateAsset(asset)
      } catch (error) {
        thrownError = error
      }

      expect(thrownError).toBeInstanceOf(AssetRepositoryError)
      expect(thrownError.originalError).toBe(databaseError)
      expect(thrownError.message).toBe(AssetRepositoryError.ERRORS.UPDATE_ASSET(asset.id))
    })
  })

  describe("getAsset", () => {
    it("should get an asset by id successfully", async () => {
      const asset = AssetUtils.newInstanceWithLifeCycleCashFlow()
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset))
      const found = await assetRepository.getAsset(asset.id)
      expect(found).toEqual(asset)
    })

    it("should return undefined if asset is not found by id", async () => {
      const found = await assetRepository.getAsset(crypto.randomUUID())
      expect(found).toBeUndefined()
    })

    it("should throw error if database error happens", async () => {
      const asset = AssetUtils.newInstance()
      const databaseError = new Error("Database error")

      jest.spyOn(internalAssetRepository, "findOne").mockImplementationOnce(() => {
        throw databaseError
      })

      let thrownError: CustomError
      try {
        await assetRepository.getAsset(asset.id)
      } catch (error) {
        thrownError = error
      }

      expect(thrownError).toBeInstanceOf(AssetRepositoryError)
      expect(thrownError.originalError).toBe(databaseError)
      expect(thrownError.message).toBe(AssetRepositoryError.ERRORS.GET_ASSET(asset.id))
    })
  })

  describe("getAssetByName", () => {
    it("should find an asset by name", async () => {
      const asset = AssetUtils.newInstance()
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset))

      const found = await assetRepository.getAssetByName(asset.name)

      expect(found).toEqual(asset)
    })

    it("should fail when duplicated name", async () => {
      const asset = AssetUtils.newInstance()
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset))
      const assetWithSameName = AssetUtils.newInstance({ name: asset.name })
      let error: Error
      try {
        await assetRepository.saveAsset(assetWithSameName)
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(AssetRepositoryError)
      expect(error.message).toBe(
        AssetRepositoryError.ERRORS.DUPLICATED_ASSET(assetWithSameName.name, assetWithSameName.hederaTokenAddress),
      )
      expect((error as AssetRepositoryError).originalError.message).toContain(
        "duplicate key value violates unique constraint",
      )
    })

    it("should throw error if database error happens", async () => {
      const asset = AssetUtils.newInstance()
      const databaseError = new Error("Database error")

      jest.spyOn(internalAssetRepository, "findOne").mockImplementationOnce(() => {
        throw databaseError
      })

      let thrownError: CustomError
      try {
        await assetRepository.getAssetByName(asset.name)
      } catch (error) {
        thrownError = error
      }

      expect(thrownError).toBeInstanceOf(AssetRepositoryError)
      expect(thrownError.originalError).toBe(databaseError)
      expect(thrownError.message).toBe(AssetRepositoryError.ERRORS.GET_ASSET_BY_NAME(asset.name))
    })
  })

  describe("getAssetByHederaTokenAddress", () => {
    it("should find an asset by hederaTokenAddress", async () => {
      const asset = AssetUtils.newInstance()
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset))

      const found = await assetRepository.getAssetByHederaTokenAddress(asset.hederaTokenAddress)

      expect(found).toEqual(asset)
    })

    it("should fail with a duplicated hederaTokenAddress", async () => {
      const asset = AssetUtils.newInstance()
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset))
      const assetWithSameHederaTokenAddress = AssetUtils.newInstance({ hederaTokenAddress: asset.hederaTokenAddress })
      let error: Error

      try {
        await assetRepository.saveAsset(assetWithSameHederaTokenAddress)
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(AssetRepositoryError)
      expect(error.message).toBe(
        AssetRepositoryError.ERRORS.DUPLICATED_ASSET(
          assetWithSameHederaTokenAddress.name,
          assetWithSameHederaTokenAddress.hederaTokenAddress,
        ),
      )
      expect((error as AssetRepositoryError).originalError.message).toContain(
        "duplicate key value violates unique constraint",
      )
    })

    it("should throw error if database error happens", async () => {
      const asset = AssetUtils.newInstance()
      const databaseError = new Error("Database error")

      jest.spyOn(internalAssetRepository, "findOne").mockImplementationOnce(() => {
        throw databaseError
      })

      let thrownError: CustomError
      try {
        await assetRepository.getAssetByHederaTokenAddress(asset.hederaTokenAddress)
      } catch (error) {
        thrownError = error
      }

      expect(thrownError).toBeInstanceOf(AssetRepositoryError)
      expect(thrownError.originalError).toBe(databaseError)
      expect(thrownError.message).toBe(
        AssetRepositoryError.ERRORS.GET_ASSET_BY_HEDERA_TOKEN_ADDRESS(asset.hederaTokenAddress),
      )
    })
  })

  describe("deleteAssets", () => {
    it("should delete assets by ids", async () => {
      const asset1 = AssetUtils.newInstance()
      const asset2 = AssetUtils.newInstance({ name: "Asset 2" })
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset1))
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset2))
      await assetRepository.deleteAssets([asset1.id, asset2.id])
      const all = await internalAssetRepository.find()
      expect(all).toHaveLength(0)
    })

    it("should throw error if database error happens", async () => {
      const asset = AssetUtils.newInstance()
      const databaseError = new Error("Database error")

      jest.spyOn(internalAssetRepository, "delete").mockImplementationOnce(() => {
        throw databaseError
      })

      let thrownError: CustomError
      try {
        await assetRepository.deleteAssets([asset.id])
      } catch (error) {
        thrownError = error
      }

      expect(thrownError).toBeInstanceOf(AssetRepositoryError)
      expect(thrownError.originalError).toBe(databaseError)
      expect(thrownError.message).toBe(AssetRepositoryError.ERRORS.DELETE_ASSETS([asset.id]))
    })
  })

  describe("getAllAssets", () => {
    it("should get all assets", async () => {
      const asset1 = AssetUtils.newInstance()
      const asset2 = AssetUtils.newInstance({ name: "Asset 2" })
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset1))
      await internalAssetRepository.insert(AssetPersistence.fromAsset(asset2))
      const all = await assetRepository.getAllAssets()
      expect(all).toHaveLength(2)
      expect(all).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: asset1.name }),
          expect.objectContaining({ name: asset2.name }),
        ]),
      )
    })

    it("should throw error if database error happens", async () => {
      const databaseError = new Error("Database error")

      jest.spyOn(internalAssetRepository, "find").mockImplementationOnce(() => {
        throw databaseError
      })

      let thrownError: CustomError
      try {
        await assetRepository.getAllAssets()
      } catch (error) {
        thrownError = error
      }

      expect(thrownError).toBeInstanceOf(AssetRepositoryError)
      expect(thrownError.originalError).toBe(databaseError)
      expect(thrownError.message).toBe(AssetRepositoryError.ERRORS.GET_ASSETS())
    })
  })

  describe("getAssets", () => {
    it("should return first page of assets with pagination", async () => {
      // Given
      const assets = [
        AssetUtils.newInstance({ name: "Asset 1" }),
        AssetUtils.newInstance({ name: "Asset 2" }),
        AssetUtils.newInstance({ name: "Asset 3" }),
      ]

      for (const asset of assets) {
        await internalAssetRepository.insert(AssetPersistence.fromAsset(asset))
      }

      // When
      const pageOptions = { page: 1, limit: 2, order: OrderPageOptions.DEFAULT }
      const result = await assetRepository.getAssets(pageOptions)

      // Then
      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(3)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(2)
      expect(result.totalPages).toBe(2)

      const names = result.items.map((item) => item.name)
      expect(names).toEqual(expect.arrayContaining([expect.stringMatching(/Asset [12]/)]))
    })
  })
})
