// SPDX-License-Identifier: Apache-2.0

import { DisableAssetSyncUseCase } from "@application/use-cases/disable-asset-sync.use-case"
import { EnableAssetSyncUseCase } from "@application/use-cases/enable-asset-sync.use-case"
import { ExecutePayoutUseCase } from "@application/use-cases/execute-payout.use-case"
import { GetAssetDistributionsUseCase } from "@application/use-cases/get-asset-distributions.use-case"
import { GetAssetUseCase } from "@application/use-cases/get-asset.use-case"
import { GetAssetsUseCase } from "@application/use-cases/get-assets.use-case"
import { GetBasicAssetInformationUseCase } from "@application/use-cases/get-basic-asset-information.use-case"
import { ImportAssetUseCase } from "@application/use-cases/import-asset.use-case"
import { PauseAssetUseCase } from "@application/use-cases/pause-asset.use-case"
import { UnpauseAssetUseCase } from "@application/use-cases/unpause-asset.use-case"
import { AssetNotFoundError } from "@domain/errors/asset.error"
import { AssetType } from "@domain/model/asset-type.enum"
import { AmountType, CorporateActionDetails, DistributionType, PayoutSubtype } from "@domain/model/distribution"
import { OrderPageOptions, PageOptions } from "@domain/model/page"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { AssetController } from "@infrastructure/rest/asset/asset.controller"
import { AssetResponse } from "@infrastructure/rest/asset/asset.response"
import { CreatePayoutRequest } from "@infrastructure/rest/asset/create-payout.request"
import { ImportAssetRequest } from "@infrastructure/rest/asset/import-asset.request"
import { DistributionResponse } from "@infrastructure/rest/distribution/distribution.response"
import { HttpStatus, INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { AssetUtils } from "@test/shared/asset.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { fakeHederaAddress, fakeLifeCycleCashFlowAddress } from "@test/shared/utils"
import request from "supertest"
import { GetDistributionHolderCountUseCase } from "@application/use-cases/get-distribution-holder-count.use-case"

describe(AssetController.name, () => {
  let app: INestApplication
  const createAssetUseCaseMock = createMock<ImportAssetUseCase>()
  const getAssetUseCaseMock = createMock<GetAssetUseCase>()
  const getAssetsUseCaseMock = createMock<GetAssetsUseCase>()
  const pauseAssetUseCaseMock = createMock<PauseAssetUseCase>()
  const unpauseAssetUseCaseMock = createMock<UnpauseAssetUseCase>()
  const getBasicAssetInformationUseCaseMock = createMock<GetBasicAssetInformationUseCase>()
  const getAssetDistributionsUseCaseMock = createMock<GetAssetDistributionsUseCase>()
  const getDistributionHolderCountUseCaseMock = createMock<GetDistributionHolderCountUseCase>()
  const executePayoutUseCaseMock = createMock<ExecutePayoutUseCase>()
  const enableAssetSyncUseCaseMock = createMock<EnableAssetSyncUseCase>()
  const disableAssetSyncUseCaseMock = createMock<DisableAssetSyncUseCase>()

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        {
          provide: ImportAssetUseCase,
          useValue: createAssetUseCaseMock,
        },
        {
          provide: GetAssetUseCase,
          useValue: getAssetUseCaseMock,
        },
        {
          provide: GetAssetsUseCase,
          useValue: getAssetsUseCaseMock,
        },
        {
          provide: PauseAssetUseCase,
          useValue: pauseAssetUseCaseMock,
        },
        {
          provide: UnpauseAssetUseCase,
          useValue: unpauseAssetUseCaseMock,
        },
        {
          provide: GetBasicAssetInformationUseCase,
          useValue: getBasicAssetInformationUseCaseMock,
        },
        {
          provide: GetAssetDistributionsUseCase,
          useValue: getAssetDistributionsUseCaseMock,
        },
        {
          provide: ExecutePayoutUseCase,
          useValue: executePayoutUseCaseMock,
        },
        {
          provide: EnableAssetSyncUseCase,
          useValue: enableAssetSyncUseCaseMock,
        },
        {
          provide: DisableAssetSyncUseCase,
          useValue: disableAssetSyncUseCaseMock,
        },
        {
          provide: GetDistributionHolderCountUseCase,
          useValue: getDistributionHolderCountUseCaseMock,
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("POST /assets", () => {
    it("should create an asset", async () => {
      const lifeCycleCashFlowAddress = fakeLifeCycleCashFlowAddress()
      const requestPayload: ImportAssetRequest = {
        hederaTokenAddress: lifeCycleCashFlowAddress.hederaAddress,
      }

      const createdAsset = AssetUtils.newInstance({
        hederaTokenAddress: requestPayload.hederaTokenAddress,
      }).withLifeCycleCashFlow(lifeCycleCashFlowAddress)

      createAssetUseCaseMock.execute.mockResolvedValue(createdAsset)

      const response = await request(app.getHttpServer())
        .post("/assets/import")
        .send(requestPayload)
        .expect(HttpStatus.CREATED)

      const expectedResponse = {
        ...AssetResponse.fromAsset(createdAsset),
        createdAt: createdAsset.createdAt.toISOString(),
        updatedAt: createdAsset.updatedAt.toISOString(),
      }

      expect(response.body).toEqual(expectedResponse)
      expect(createAssetUseCaseMock.execute).toHaveBeenCalledWith(requestPayload.hederaTokenAddress)
    })

    it("should return 400 for invalid request payload", async () => {
      const invalidPayload = {
        name: "",
        hederaTokenAddress: "invalid-address",
      }

      const response = await request(app.getHttpServer())
        .post("/assets/import")
        .send(invalidPayload)
        .expect(HttpStatus.BAD_REQUEST)

      expect(response.body.message).toEqual(
        expect.stringContaining("hederaTokenAddress must be a valid Hedera address format"),
      )
    })

    it("should return 500 if use case fails", async () => {
      const requestPayload: ImportAssetRequest = {
        hederaTokenAddress: `0.0.${faker.number.int({ min: 10000, max: 99999 })}`,
      }

      createAssetUseCaseMock.execute.mockRejectedValue(new Error("Service error"))

      await request(app.getHttpServer())
        .post("/assets/import")
        .send(requestPayload)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(createAssetUseCaseMock.execute).toHaveBeenCalled()
    })
  })

  describe("GET /assets", () => {
    it("should return all assets successfully", async () => {
      const asset1 = AssetUtils.newInstance()
      const asset2 = AssetUtils.newInstance()
      const assets = {
        items: [asset1, asset2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      getAssetsUseCaseMock.execute.mockResolvedValue(assets)

      const response = await request(app.getHttpServer()).get("/assets").expect(HttpStatus.OK)

      const expectedResponse = {
        items: assets.items.map((asset) => ({
          ...AssetResponse.fromAsset(asset),
          createdAt: asset.createdAt.toISOString(),
          updatedAt: asset.updatedAt.toISOString(),
        })),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      expect(response.body).toEqual(expectedResponse)
      expect(response.body.items).toHaveLength(2)
      expect(getAssetsUseCaseMock.execute).toHaveBeenCalledWith(PageOptions.DEFAULT)
    })

    it("should return empty page when no assets exist", async () => {
      const emptyPage = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      getAssetsUseCaseMock.execute.mockResolvedValue(emptyPage)

      const response = await request(app.getHttpServer()).get("/assets").expect(HttpStatus.OK)

      expect(response.body).toEqual(emptyPage)
      expect(response.body.items).toHaveLength(0)
      expect(getAssetsUseCaseMock.execute).toHaveBeenCalledWith(PageOptions.DEFAULT)
    })

    it("should return 500 if use case fails", async () => {
      getAssetsUseCaseMock.execute.mockRejectedValue(new Error("Database connection error"))

      await request(app.getHttpServer()).get("/assets").expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(getAssetsUseCaseMock.execute).toHaveBeenCalledWith(PageOptions.DEFAULT)
    })

    it("should accept pagination parameters", async () => {
      const asset1 = AssetUtils.newInstance()
      const assets = {
        items: [asset1],
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      }

      getAssetsUseCaseMock.execute.mockResolvedValue(assets)

      const response = await request(app.getHttpServer())
        .get("/assets?page=2&limit=5&orderBy=updatedAt&order=asc")
        .expect(HttpStatus.OK)

      const expectedResponse = {
        items: assets.items.map((asset) => ({
          ...AssetResponse.fromAsset(asset),
          createdAt: asset.createdAt.toISOString(),
          updatedAt: asset.updatedAt.toISOString(),
        })),
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      }

      expect(response.body).toEqual(expectedResponse)
      expect(getAssetsUseCaseMock.execute).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        order: { orderBy: "updatedAt", order: "asc" },
      })
    })
  })

  describe("GET /assets/:id", () => {
    it("should return an asset successfully", async () => {
      const assetId = faker.string.uuid()
      const asset = AssetUtils.newInstance({ id: assetId })

      getAssetUseCaseMock.execute.mockResolvedValue(asset)

      const response = await request(app.getHttpServer()).get(`/assets/${assetId}`).expect(HttpStatus.OK)

      const expectedResponse = {
        ...AssetResponse.fromAsset(asset),
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
      }

      expect(response.body).toEqual(expectedResponse)
      expect(response.body.type).toBe(asset.type)
      expect(response.body.isPaused).toBe(asset.isPaused)
      expect(getAssetUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return 404 when asset is not found", async () => {
      const assetId = faker.string.uuid()

      getAssetUseCaseMock.execute.mockRejectedValue(new AssetNotFoundError(assetId))

      await request(app.getHttpServer()).get(`/assets/${assetId}`).expect(HttpStatus.NOT_FOUND)

      expect(getAssetUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return 500 if use case fails with unexpected error", async () => {
      const assetId = faker.string.uuid()

      getAssetUseCaseMock.execute.mockRejectedValue(new Error("Database connection error"))

      await request(app.getHttpServer()).get(`/assets/${assetId}`).expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(getAssetUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })
  })

  describe("PATCH /assets/:assetId/pause", () => {
    it("should pause an asset successfully", async () => {
      const assetId = faker.string.uuid()
      const asset = AssetUtils.newInstance({ id: assetId })

      pauseAssetUseCaseMock.execute.mockResolvedValue(asset)

      await request(app.getHttpServer()).patch(`/assets/${assetId}/pause`).expect(HttpStatus.OK)

      expect(pauseAssetUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return 500 if pause use case fails", async () => {
      const assetId = faker.string.uuid()

      pauseAssetUseCaseMock.execute.mockRejectedValue(new Error("Pause service error"))

      await request(app.getHttpServer()).patch(`/assets/${assetId}/pause`).expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(pauseAssetUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })
  })

  describe("PATCH /assets/:assetId/unpause", () => {
    it("should unpause an asset successfully", async () => {
      const assetId = faker.string.uuid()
      const asset = AssetUtils.newInstance({ id: assetId })

      unpauseAssetUseCaseMock.execute.mockResolvedValue(asset)

      await request(app.getHttpServer()).patch(`/assets/${assetId}/unpause`).expect(HttpStatus.OK)

      expect(unpauseAssetUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return 500 if unpause use case fails", async () => {
      const assetId = faker.string.uuid()

      unpauseAssetUseCaseMock.execute.mockRejectedValue(new Error("Unpause service error"))

      await request(app.getHttpServer()).patch(`/assets/${assetId}/unpause`).expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(unpauseAssetUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })
  })

  describe("GET /assets/:hederaTokenAddress/metadata", () => {
    it("should return basic asset information successfully without maturity date", async () => {
      const hederaTokenAddress = fakeHederaAddress()
      const expectedBasicInfo = {
        hederaTokenAddress,
        name: faker.finance.accountName(),
        symbol: faker.finance.currencyCode(),
        assetType: AssetType.EQUITY,
      }

      getBasicAssetInformationUseCaseMock.execute.mockResolvedValue(expectedBasicInfo)

      const response = await request(app.getHttpServer())
        .get(`/assets/${hederaTokenAddress}/metadata`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(expectedBasicInfo)
      expect(response.body.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(response.body.name).toBe(expectedBasicInfo.name)
      expect(response.body.symbol).toBe(expectedBasicInfo.symbol)
      expect(response.body.assetType).toBe(AssetType.EQUITY)
      expect(response.body.maturityDate).toBeUndefined()
      expect(getBasicAssetInformationUseCaseMock.execute).toHaveBeenCalledWith(hederaTokenAddress)
    })

    it("should return basic asset information successfully with maturity date", async () => {
      const hederaTokenAddress = fakeHederaAddress()
      const maturityDate = faker.date.future()
      const expectedBasicInfo = {
        hederaTokenAddress,
        name: faker.finance.accountName(),
        symbol: faker.finance.currencyCode(),
        assetType: AssetType.BOND_VARIABLE_RATE,
        maturityDate,
      }

      getBasicAssetInformationUseCaseMock.execute.mockResolvedValue(expectedBasicInfo)

      const response = await request(app.getHttpServer())
        .get(`/assets/${hederaTokenAddress}/metadata`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        ...expectedBasicInfo,
        maturityDate: maturityDate.toISOString(),
      })
      expect(response.body.hederaTokenAddress).toBe(hederaTokenAddress)
      expect(response.body.name).toBe(expectedBasicInfo.name)
      expect(response.body.symbol).toBe(expectedBasicInfo.symbol)
      expect(response.body.assetType).toBe(AssetType.BOND_VARIABLE_RATE)
      expect(response.body.maturityDate).toBe(maturityDate.toISOString())
      expect(getBasicAssetInformationUseCaseMock.execute).toHaveBeenCalledWith(hederaTokenAddress)
    })

    it("should return 400 for invalid asset ID format", async () => {
      const invalidAssetId = "invalid-uuid"

      await request(app.getHttpServer()).get(`/assets/${invalidAssetId}/metadata`).expect(HttpStatus.BAD_REQUEST)

      expect(getBasicAssetInformationUseCaseMock.execute).not.toHaveBeenCalled()
    })

    it("should return 404 when asset is not found", async () => {
      const hederaTokenAddress = fakeHederaAddress()

      getBasicAssetInformationUseCaseMock.execute.mockRejectedValue(new AssetNotFoundError(hederaTokenAddress))

      await request(app.getHttpServer()).get(`/assets/${hederaTokenAddress}/metadata`).expect(HttpStatus.NOT_FOUND)

      expect(getBasicAssetInformationUseCaseMock.execute).toHaveBeenCalledWith(hederaTokenAddress)
    })

    it("should return 500 if use case fails with unexpected error", async () => {
      const hederaTokenAddress = fakeHederaAddress()

      getBasicAssetInformationUseCaseMock.execute.mockRejectedValue(new Error("On-chain repository error"))

      await request(app.getHttpServer())
        .get(`/assets/${hederaTokenAddress}/metadata`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(getBasicAssetInformationUseCaseMock.execute).toHaveBeenCalledWith(hederaTokenAddress)
    })
  })

  describe("GET /assets/:assetId/distributions", () => {
    it("should return paginated distributions for an asset", async () => {
      // Given
      const asset = AssetUtils.newInstance()
      const distribution1 = DistributionUtils.newInstance({ asset })
      const distribution2 = DistributionUtils.newInstance({
        asset,
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.RECURRING,
        } as any,
      })
      const distributions = {
        items: [distribution1, distribution2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
      const holdersNumber = 2

      getAssetDistributionsUseCaseMock.execute.mockResolvedValue(distributions)
      getDistributionHolderCountUseCaseMock.execute.mockResolvedValue(holdersNumber)

      // When
      const response = await request(app.getHttpServer()).get(`/assets/${asset.id}/distributions`).expect(HttpStatus.OK)

      // Then
      const expectedResponse = {
        items: distributions.items.map((distribution) => ({
          ...DistributionResponse.fromDistribution(distribution),
          createdAt: distribution.createdAt.toISOString(),
          updatedAt: distribution.updatedAt.toISOString(),
          executionDate: (
            (distribution.details as CorporateActionDetails).executionDate || (distribution.details as any).executeAt
          ).toISOString(),
          holdersNumber,
          asset: {
            ...AssetResponse.fromAsset(distribution.asset),
            createdAt: distribution.asset.createdAt.toISOString(),
            updatedAt: distribution.asset.updatedAt.toISOString(),
          },
        })),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      expect(response.body).toEqual(expectedResponse)
      expect(getAssetDistributionsUseCaseMock.execute).toHaveBeenCalledWith(asset.id, PageOptions.DEFAULT)
    })

    it("should return empty page when no distributions exist", async () => {
      // Given
      const asset = AssetUtils.newInstance()
      const emptyPage = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      getAssetDistributionsUseCaseMock.execute.mockResolvedValue(emptyPage)

      // When
      const response = await request(app.getHttpServer()).get(`/assets/${asset.id}/distributions`).expect(HttpStatus.OK)

      // Then
      expect(response.body).toEqual(emptyPage)
      expect(getAssetDistributionsUseCaseMock.execute).toHaveBeenCalledWith(asset.id, PageOptions.DEFAULT)
    })

    it("should accept custom pagination parameters", async () => {
      // Given
      const asset = AssetUtils.newInstance()
      const distribution = DistributionUtils.newInstance({ asset })
      const distributions = {
        items: [distribution],
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      }
      const holdersNumber = 3

      getAssetDistributionsUseCaseMock.execute.mockResolvedValue(distributions)
      getDistributionHolderCountUseCaseMock.execute.mockResolvedValue(holdersNumber)

      // When
      const response = await request(app.getHttpServer())
        .get(`/assets/${asset.id}/distributions`)
        .query({ page: 2, limit: 5 })
        .expect(HttpStatus.OK)

      // Then
      const expectedResponse = {
        items: distributions.items.map((distribution) => ({
          ...DistributionResponse.fromDistribution(distribution),
          createdAt: distribution.createdAt.toISOString(),
          updatedAt: distribution.updatedAt.toISOString(),
          executionDate: (distribution.details as CorporateActionDetails).executionDate.toISOString(),
          holdersNumber,
          asset: {
            ...AssetResponse.fromAsset(distribution.asset),
            createdAt: distribution.asset.createdAt.toISOString(),
            updatedAt: distribution.asset.updatedAt.toISOString(),
          },
        })),
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      }

      expect(response.body).toEqual(expectedResponse)
      expect(getAssetDistributionsUseCaseMock.execute).toHaveBeenCalledWith(asset.id, {
        page: 2,
        limit: 5,
        order: OrderPageOptions.DEFAULT,
      })
    })

    it("should return 500 if use case fails", async () => {
      // Given
      const asset = AssetUtils.newInstance()
      getAssetDistributionsUseCaseMock.execute.mockRejectedValue(new Error("Service error"))

      // When/Then
      await request(app.getHttpServer())
        .get(`/assets/${asset.id}/distributions`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(getAssetDistributionsUseCaseMock.execute).toHaveBeenCalledWith(asset.id, PageOptions.DEFAULT)
    })
  })

  describe("POST /assets/:assetId/distributions/payout", () => {
    const assetId = faker.string.uuid()
    const payload: CreatePayoutRequest = {
      subtype: PayoutSubtype.ONE_OFF,
      executeAt: faker.date.future().toISOString(),
      amount: faker.number.int({ min: 1, max: 1000 }).toString(),
      amountType: faker.helpers.objectValue(AmountType),
      concept: faker.string.alpha({ length: 10 }),
    }

    it("should execute payout successfully", async () => {
      executePayoutUseCaseMock.execute.mockResolvedValue(undefined)
      const expected = {
        ...payload,
        executeAt: new Date(payload.executeAt),
        assetId,
      }

      await request(app.getHttpServer())
        .post(`/assets/${assetId}/distributions/payout`)
        .send(payload)
        .expect(HttpStatus.CREATED)

      expect(executePayoutUseCaseMock.execute).toHaveBeenCalledWith(expected)
    })

    it("should return 404 when asset is not found", async () => {
      executePayoutUseCaseMock.execute.mockRejectedValue(new AssetNotFoundError(assetId))
      const expected = {
        ...payload,
        executeAt: new Date(payload.executeAt),
        assetId,
      }

      await request(app.getHttpServer())
        .post(`/assets/${assetId}/distributions/payout`)
        .send(payload)
        .expect(HttpStatus.NOT_FOUND)

      expect(executePayoutUseCaseMock.execute).toHaveBeenCalledWith(expected)
    })

    it("should return 500 when use case throws unexpected error", async () => {
      executePayoutUseCaseMock.execute.mockRejectedValue(new Error("Unexpected error"))
      const expected = {
        ...payload,
        executeAt: new Date(payload.executeAt),
        assetId,
      }

      await request(app.getHttpServer())
        .post(`/assets/${assetId}/distributions/payout`)
        .send(payload)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(executePayoutUseCaseMock.execute).toHaveBeenCalledWith(expected)
    })

    it("should handle special characters in assetId", async () => {
      const specialAssetId = "asset-123-test"
      executePayoutUseCaseMock.execute.mockResolvedValue(undefined)
      const expected = {
        ...payload,
        executeAt: new Date(payload.executeAt),
        assetId: specialAssetId,
      }

      await request(app.getHttpServer())
        .post(`/assets/${specialAssetId}/distributions/payout`)
        .send(payload)
        .expect(HttpStatus.CREATED)

      expect(executePayoutUseCaseMock.execute).toHaveBeenCalledWith(expected)
    })
  })

  describe("Patch /assets/:assetId/enable-sync", () => {
    it("should enable the synchronization of an asset successfully", async () => {
      const assetId = faker.string.uuid()
      const syncEnabledAsset = AssetUtils.newInstance({ id: assetId, syncEnabled: true })
      enableAssetSyncUseCaseMock.execute.mockResolvedValue(syncEnabledAsset)
      await request(app.getHttpServer()).patch(`/assets/${assetId}/enable-sync`).expect(HttpStatus.OK)

      expect(enableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return 404 when asset does not exist", async () => {
      const assetId = faker.string.uuid()
      enableAssetSyncUseCaseMock.execute.mockRejectedValue(new AssetNotFoundError(assetId))

      await request(app.getHttpServer()).patch(`/assets/${assetId}/enable-sync`).expect(HttpStatus.NOT_FOUND)

      expect(enableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return asset without changes when synchronization already enabled", async () => {
      const assetId = faker.string.uuid()
      const alreadySyncEnabledAsset = AssetUtils.newInstance({ id: assetId, syncEnabled: true })
      enableAssetSyncUseCaseMock.execute.mockResolvedValue(alreadySyncEnabledAsset)

      await request(app.getHttpServer()).patch(`/assets/${assetId}/enable-sync`).expect(HttpStatus.OK)

      expect(enableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return 500 when use case throws unexpected error", async () => {
      const assetId = faker.string.uuid()
      enableAssetSyncUseCaseMock.execute.mockRejectedValue(new Error("Repository update failed"))

      await request(app.getHttpServer())
        .patch(`/assets/${assetId}/enable-sync`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(enableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should enable the synchronization of a BOND type asset successfully", async () => {
      const assetId = faker.string.uuid()
      const syncEnabledAsset = AssetUtils.newInstance({
        id: assetId,
        type: AssetType.BOND_VARIABLE_RATE,
        syncEnabled: true,
      })
      enableAssetSyncUseCaseMock.execute.mockResolvedValue(syncEnabledAsset)

      await request(app.getHttpServer()).patch(`/assets/${assetId}/enable-sync`).expect(HttpStatus.OK)

      expect(enableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })
  })

  describe("Patch /assets/:assetId/disable-sync", () => {
    it("should disable the synchronization of an asset successfully", async () => {
      const assetId = faker.string.uuid()
      const syncEnabledAsset = AssetUtils.newInstance({ id: assetId, syncEnabled: true })
      disableAssetSyncUseCaseMock.execute.mockResolvedValue(syncEnabledAsset)
      await request(app.getHttpServer()).patch(`/assets/${assetId}/disable-sync`).expect(HttpStatus.OK)

      expect(disableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return 404 when asset does not exist", async () => {
      const assetId = faker.string.uuid()
      disableAssetSyncUseCaseMock.execute.mockRejectedValue(new AssetNotFoundError(assetId))

      await request(app.getHttpServer()).patch(`/assets/${assetId}/disable-sync`).expect(HttpStatus.NOT_FOUND)

      expect(disableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return asset without changes when synchronization already disabled", async () => {
      const assetId = faker.string.uuid()
      const alreadySyncDisabledAsset = AssetUtils.newInstance({ id: assetId, syncEnabled: false })
      disableAssetSyncUseCaseMock.execute.mockResolvedValue(alreadySyncDisabledAsset)

      await request(app.getHttpServer()).patch(`/assets/${assetId}/disable-sync`).expect(HttpStatus.OK)

      expect(disableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should return 500 when use case throws unexpected error", async () => {
      const assetId = faker.string.uuid()
      disableAssetSyncUseCaseMock.execute.mockRejectedValue(new Error("Repository update failed"))

      await request(app.getHttpServer())
        .patch(`/assets/${assetId}/disable-sync`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(disableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })

    it("should disable the synchronization of a BOND type asset successfully", async () => {
      const assetId = faker.string.uuid()
      const syncEnabledAsset = AssetUtils.newInstance({
        id: assetId,
        type: AssetType.BOND_VARIABLE_RATE,
        syncEnabled: true,
      })
      disableAssetSyncUseCaseMock.execute.mockResolvedValue(syncEnabledAsset)

      await request(app.getHttpServer()).patch(`/assets/${assetId}/disable-sync`).expect(HttpStatus.OK)

      expect(disableAssetSyncUseCaseMock.execute).toHaveBeenCalledWith(assetId)
    })
  })
})
