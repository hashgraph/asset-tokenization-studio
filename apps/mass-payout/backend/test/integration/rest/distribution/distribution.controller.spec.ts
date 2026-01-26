// SPDX-License-Identifier: Apache-2.0

import { GetDistributionHoldersUseCase } from "@application/use-cases/get-distribution-holders.use-case"
import { GetDistributionUseCase } from "@application/use-cases/get-distribution.use-case"
import { GetDistributionsUseCase } from "@application/use-cases/get-distributions.use-case"
import {
  DistributionNotFoundError,
  DistributionNotInStatusError,
  DistributionNotPayoutError,
} from "@domain/errors/distribution.error"
import {
  CorporateActionDetails,
  DistributionStatus,
  PayoutDetails,
  DistributionType,
  PayoutSubtype,
  AmountType,
} from "@domain/model/distribution"
import { PageOptions } from "@domain/model/page"
import { createMock } from "@golevelup/ts-jest"
import { DistributionController } from "@infrastructure/rest/distribution/distribution.controller"
import { HttpStatus, INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { DistributionUtils } from "@test/shared/distribution.utils"
import request from "supertest"
import { CancelDistributionUseCase } from "@application/use-cases/cancel-distribution.use-case"
import { RetryFailedHoldersUseCase } from "@application/use-cases/retry-failed-holders.use-case"

describe(DistributionController.name, () => {
  let app: INestApplication
  const getDistributionUseCaseMock = createMock<GetDistributionUseCase>()
  const getDistributionsUseCaseMock = createMock<GetDistributionsUseCase>()
  const getDistributionHoldersUseCaseMock = createMock<GetDistributionHoldersUseCase>()
  const cancelDistributionUseCaseMock = createMock<CancelDistributionUseCase>()
  const retryFailedHoldersUseCaseMock = createMock<RetryFailedHoldersUseCase>()

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DistributionController],
      providers: [
        {
          provide: GetDistributionUseCase,
          useValue: getDistributionUseCaseMock,
        },
        {
          provide: GetDistributionsUseCase,
          useValue: getDistributionsUseCaseMock,
        },
        {
          provide: GetDistributionHoldersUseCase,
          useValue: getDistributionHoldersUseCaseMock,
        },
        {
          provide: CancelDistributionUseCase,
          useValue: cancelDistributionUseCaseMock,
        },
        {
          provide: RetryFailedHoldersUseCase,
          useValue: retryFailedHoldersUseCaseMock,
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

  describe("GET /distributions", () => {
    it("should return paginated distributions successfully", async () => {
      const distribution1 = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
      })
      const distribution2 = DistributionUtils.newInstance({
        status: DistributionStatus.COMPLETED,
      })

      const pageOptions: PageOptions = { page: 1, limit: 10, order: { order: "DESC", orderBy: "createdAt" } }
      const expectedPage = {
        items: [distribution1, distribution2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      getDistributionsUseCaseMock.execute.mockResolvedValue(expectedPage)

      const response = await request(app.getHttpServer())
        .get("/distributions")
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        items: [
          {
            id: distribution1.id,
            asset: {
              id: distribution1.asset.id,
              name: distribution1.asset.name,
              type: distribution1.asset.type,
              hederaTokenAddress: distribution1.asset.hederaTokenAddress,
              evmTokenAddress: distribution1.asset.evmTokenAddress,
              symbol: distribution1.asset.symbol,
              lifeCycleCashFlowHederaAddress: distribution1.asset.lifeCycleCashFlowHederaAddress,
              lifeCycleCashFlowEvmAddress: distribution1.asset.lifeCycleCashFlowEvmAddress,
              maturityDate: distribution1.asset.maturityDate?.toISOString(),
              isPaused: distribution1.asset.isPaused,
              syncEnabled: distribution1.asset.syncEnabled,
              createdAt: distribution1.asset.createdAt.toISOString(),
              updatedAt: distribution1.asset.updatedAt.toISOString(),
            },
            corporateActionID: (distribution1.details as any).corporateActionId.value,
            executionDate: (distribution1.details as any).executionDate.toISOString(),
            status: distribution1.status,
            type: distribution1.details.type,
            createdAt: distribution1.createdAt.toISOString(),
            updatedAt: distribution1.updatedAt.toISOString(),
          },
          {
            id: distribution2.id,
            asset: {
              id: distribution2.asset.id,
              name: distribution2.asset.name,
              type: distribution2.asset.type,
              hederaTokenAddress: distribution2.asset.hederaTokenAddress,
              evmTokenAddress: distribution2.asset.evmTokenAddress,
              symbol: distribution2.asset.symbol,
              lifeCycleCashFlowHederaAddress: distribution2.asset.lifeCycleCashFlowHederaAddress,
              lifeCycleCashFlowEvmAddress: distribution2.asset.lifeCycleCashFlowEvmAddress,
              maturityDate: distribution2.asset.maturityDate?.toISOString(),
              isPaused: distribution2.asset.isPaused,
              syncEnabled: distribution2.asset.syncEnabled,
              createdAt: distribution2.asset.createdAt.toISOString(),
              updatedAt: distribution2.asset.updatedAt.toISOString(),
            },
            corporateActionID: (distribution2.details as any).corporateActionId.value,
            executionDate: (distribution2.details as any).executionDate.toISOString(),
            status: distribution2.status,
            type: distribution2.details.type,
            createdAt: distribution2.createdAt.toISOString(),
            updatedAt: distribution2.updatedAt.toISOString(),
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
      expect(getDistributionsUseCaseMock.execute).toHaveBeenCalledWith(pageOptions)
    })

    it("should return empty page when no distributions exist", async () => {
      const pageOptions: PageOptions = { page: 1, limit: 10, order: { order: "DESC", orderBy: "createdAt" } }
      const expectedPage = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      getDistributionsUseCaseMock.execute.mockResolvedValue(expectedPage)

      const response = await request(app.getHttpServer())
        .get("/distributions")
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
      expect(getDistributionsUseCaseMock.execute).toHaveBeenCalledWith(pageOptions)
    })

    it("should use default pagination when no query parameters provided", async () => {
      const pageOptions: PageOptions = { page: 1, limit: 10, order: { order: "DESC", orderBy: "createdAt" } }
      const expectedPage = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      getDistributionsUseCaseMock.execute.mockResolvedValue(expectedPage)

      await request(app.getHttpServer()).get("/distributions").expect(HttpStatus.OK)

      expect(getDistributionsUseCaseMock.execute).toHaveBeenCalledWith(pageOptions)
    })

    it("should handle custom pagination parameters", async () => {
      const pageOptions: PageOptions = { page: 2, limit: 5, order: { order: "DESC", orderBy: "createdAt" } }
      const expectedPage = {
        items: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      }

      getDistributionsUseCaseMock.execute.mockResolvedValue(expectedPage)

      const response = await request(app.getHttpServer())
        .get("/distributions")
        .query({ page: 2, limit: 5 })
        .expect(HttpStatus.OK)

      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(5)
      expect(getDistributionsUseCaseMock.execute).toHaveBeenCalledWith(pageOptions)
    })
  })

  describe("GET /distributions/:distributionId", () => {
    it("should return corporate action distribution when found", async () => {
      const distribution = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
      })

      getDistributionUseCaseMock.execute.mockResolvedValue(distribution)

      const response = await request(app.getHttpServer()).get(`/distributions/${distribution.id}`).expect(HttpStatus.OK)

      expect(response.body).toEqual({
        id: distribution.id,
        asset: {
          id: distribution.asset.id,
          name: distribution.asset.name,
          type: distribution.asset.type,
          hederaTokenAddress: distribution.asset.hederaTokenAddress,
          evmTokenAddress: distribution.asset.evmTokenAddress,
          symbol: distribution.asset.symbol,
          lifeCycleCashFlowHederaAddress: distribution.asset.lifeCycleCashFlowHederaAddress,
          lifeCycleCashFlowEvmAddress: distribution.asset.lifeCycleCashFlowEvmAddress,
          maturityDate: distribution.asset.maturityDate?.toISOString(),
          isPaused: distribution.asset.isPaused,
          syncEnabled: distribution.asset.syncEnabled,
          createdAt: distribution.asset.createdAt.toISOString(),
          updatedAt: distribution.asset.updatedAt.toISOString(),
        },
        corporateActionID: (distribution.details as CorporateActionDetails).corporateActionId.value,
        executionDate: (distribution.details as CorporateActionDetails).executionDate.toISOString(),
        status: distribution.status,
        type: distribution.details.type,
        createdAt: distribution.createdAt.toISOString(),
        updatedAt: distribution.updatedAt.toISOString(),
      })
      expect(getDistributionUseCaseMock.execute).toHaveBeenCalledWith(distribution.id)
    })

    it("should return payout distribution with amount and subtype when found", async () => {
      const distribution = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.ONE_OFF,
          amount: "100",
          amountType: AmountType.FIXED,
        } as any,
      })

      getDistributionUseCaseMock.execute.mockResolvedValue(distribution)

      const response = await request(app.getHttpServer()).get(`/distributions/${distribution.id}`).expect(HttpStatus.OK)

      expect(response.body).toEqual({
        id: distribution.id,
        asset: {
          id: distribution.asset.id,
          name: distribution.asset.name,
          type: distribution.asset.type,
          hederaTokenAddress: distribution.asset.hederaTokenAddress,
          evmTokenAddress: distribution.asset.evmTokenAddress,
          symbol: distribution.asset.symbol,
          lifeCycleCashFlowHederaAddress: distribution.asset.lifeCycleCashFlowHederaAddress,
          lifeCycleCashFlowEvmAddress: distribution.asset.lifeCycleCashFlowEvmAddress,
          maturityDate: distribution.asset.maturityDate?.toISOString(),
          isPaused: distribution.asset.isPaused,
          syncEnabled: distribution.asset.syncEnabled,
          createdAt: distribution.asset.createdAt.toISOString(),
          updatedAt: distribution.asset.updatedAt.toISOString(),
        },
        concept: (distribution.details as PayoutDetails).concept,
        amount: (distribution.details as PayoutDetails).amount,
        amountType: (distribution.details as PayoutDetails).amountType,
        subtype: (distribution.details as PayoutDetails).subtype,
        executionDate: (distribution.details as any).executeAt.toISOString(),
        status: distribution.status,
        type: distribution.details.type,
        createdAt: distribution.createdAt.toISOString(),
        updatedAt: distribution.updatedAt.toISOString(),
      })
      expect(getDistributionUseCaseMock.execute).toHaveBeenCalledWith(distribution.id)
    })

    it("should return 404 when distribution is not found", async () => {
      const distributionId = "non-existent-id"
      getDistributionUseCaseMock.execute.mockRejectedValue(new DistributionNotFoundError(distributionId))

      await request(app.getHttpServer()).get(`/distributions/${distributionId}`).expect(HttpStatus.NOT_FOUND)

      expect(getDistributionUseCaseMock.execute).toHaveBeenCalledWith(distributionId)
    })

    it("should return 500 if use case fails with unexpected error", async () => {
      const distributionId = "some-id"
      getDistributionUseCaseMock.execute.mockRejectedValue(new Error("Repository error"))

      await request(app.getHttpServer())
        .get(`/distributions/${distributionId}`)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(getDistributionUseCaseMock.execute).toHaveBeenCalledWith(distributionId)
    })
  })

  describe("PATCH /distributions/:distributionId/cancel", () => {
    it("should cancel distribution", async () => {
      const distribution = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
      })

      cancelDistributionUseCaseMock.execute.mockResolvedValue(undefined)

      await request(app.getHttpServer()).patch(`/distributions/${distribution.id}/cancel`).expect(HttpStatus.OK)

      expect(cancelDistributionUseCaseMock.execute).toHaveBeenCalledWith({ distributionId: distribution.id })
    })

    it("should return 404 when distribution is not found", async () => {
      const distributionId = "non-existent-id"
      cancelDistributionUseCaseMock.execute.mockRejectedValue(new DistributionNotFoundError(distributionId))

      await request(app.getHttpServer()).patch(`/distributions/${distributionId}/cancel`).expect(HttpStatus.NOT_FOUND)

      expect(cancelDistributionUseCaseMock.execute).toHaveBeenCalledWith({ distributionId: distributionId })
    })

    it("should return 409 if distribution is not a payout", async () => {
      const distributionId = "some-id"
      cancelDistributionUseCaseMock.execute.mockRejectedValue(new DistributionNotPayoutError(distributionId))

      await request(app.getHttpServer()).patch(`/distributions/${distributionId}/cancel`).expect(HttpStatus.CONFLICT)

      expect(cancelDistributionUseCaseMock.execute).toHaveBeenCalledWith({ distributionId: distributionId })
    })

    it("should return 409 if distribution is not in SCHEDULED status", async () => {
      const distributionId = "some-id"
      cancelDistributionUseCaseMock.execute.mockRejectedValue(
        new DistributionNotInStatusError(distributionId, DistributionStatus.SCHEDULED),
      )

      await request(app.getHttpServer()).patch(`/distributions/${distributionId}/cancel`).expect(HttpStatus.CONFLICT)

      expect(cancelDistributionUseCaseMock.execute).toHaveBeenCalledWith({ distributionId: distributionId })
    })
  })

  describe("PATCH /distributions/:distributionId/retry", () => {
    it("should retry distribution", async () => {
      const distribution = DistributionUtils.newInstance({
        status: DistributionStatus.FAILED,
      })

      retryFailedHoldersUseCaseMock.execute.mockResolvedValue(undefined)

      await request(app.getHttpServer()).patch(`/distributions/${distribution.id}/retry`).expect(HttpStatus.OK)

      expect(retryFailedHoldersUseCaseMock.execute).toHaveBeenCalledWith({ distributionId: distribution.id })
    })

    it("should return 404 when distribution is not found", async () => {
      const distributionId = "non-existent-id"
      retryFailedHoldersUseCaseMock.execute.mockRejectedValue(new DistributionNotFoundError(distributionId))

      await request(app.getHttpServer()).patch(`/distributions/${distributionId}/retry`).expect(HttpStatus.NOT_FOUND)

      expect(retryFailedHoldersUseCaseMock.execute).toHaveBeenCalledWith({ distributionId: distributionId })
    })

    it("should return 409 if distribution is not in FAILED status", async () => {
      const distributionId = "some-id"
      retryFailedHoldersUseCaseMock.execute.mockRejectedValue(
        new DistributionNotInStatusError(distributionId, DistributionStatus.FAILED),
      )

      await request(app.getHttpServer()).patch(`/distributions/${distributionId}/retry`).expect(HttpStatus.CONFLICT)

      expect(retryFailedHoldersUseCaseMock.execute).toHaveBeenCalledWith({ distributionId: distributionId })
    })
  })
})
