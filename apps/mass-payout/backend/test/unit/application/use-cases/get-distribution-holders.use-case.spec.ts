// SPDX-License-Identifier: Apache-2.0

import { GetDistributionHoldersUseCase } from "@application/use-cases/get-distribution-holders.use-case"
import { GetDistributionUseCase } from "@application/use-cases/get-distribution.use-case"
import { BatchPayout, BatchPayoutStatus } from "@domain/model/batch-payout"
import { Holder, HolderStatus } from "@domain/model/holder"
import { Page, PageOptions } from "@domain/model/page"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { faker } from "@faker-js/faker/."
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { fakeHederaTxId } from "@test/shared/utils"

describe(GetDistributionHoldersUseCase.name, () => {
  let getDistributionHoldersUseCase: GetDistributionHoldersUseCase
  const holderRepositoryMock = createMock<HolderRepository>()
  const getDistributionUseCaseMock = createMock<GetDistributionUseCase>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetDistributionHoldersUseCase,
          useFactory: (getDistributionUseCase: GetDistributionUseCase, holderRepository: HolderRepository) => {
            return new GetDistributionHoldersUseCase(getDistributionUseCase, holderRepository)
          },
          inject: ["GetDistributionUseCase", "HolderRepository"],
        },
        {
          provide: "HolderRepository",
          useValue: holderRepositoryMock,
        },
        {
          provide: "GetDistributionUseCase",
          useValue: getDistributionUseCaseMock,
        },
      ],
    }).compile()

    getDistributionHoldersUseCase = module.get<GetDistributionHoldersUseCase>(GetDistributionHoldersUseCase)

    jest.clearAllMocks()
  })

  describe("execute", () => {
    const distributionId = "distribution-123"

    const mockHolder = (overrides?: Partial<Holder>): Holder => {
      const hederaTxId = fakeHederaTxId()

      const mockBatchPayout = BatchPayout.create(
        DistributionUtils.newInstance(),
        faker.string.alpha({ length: 10 }),
        hederaTxId,
        `0x${faker.string.hexadecimal({ length: 96, prefix: "" })}`,
        2,
        BatchPayoutStatus.FAILED,
      )

      const hederaAccountId = `0.0.${Math.floor(Math.random() * 1000)}`

      const holder = Holder.create(
        mockBatchPayout,
        hederaAccountId,
        faker.finance.ethereumAddress(),
        2,
        HolderStatus.FAILED,
        new Date(Date.now() + 3600000),
        "Some error occurred",
        faker.number.int({ min: 1, max: 1000 }).toString(),
        new Date(),
        new Date(),
      )

      if (overrides) {
        Object.assign(holder, overrides)
      }

      return holder
    }

    it("should return paginated failed holders when they exist", async () => {
      const holder1 = mockHolder({ id: "fh-1" })
      const holder2 = mockHolder({ id: "fh-2" })

      const pageOptions: PageOptions = {
        page: 1,
        limit: 10,
        order: { order: "DESC", orderBy: "createdAt" },
      }

      const expectedPage: Page<Holder> = {
        items: [holder1, holder2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      holderRepositoryMock.getHoldersByDistributionId.mockResolvedValue(expectedPage)

      const result = await getDistributionHoldersUseCase.execute(distributionId, pageOptions)

      expect(result).toEqual(expectedPage)
      expect(holderRepositoryMock.getHoldersByDistributionId).toHaveBeenCalledWith(distributionId, pageOptions)
    })

    it("should return empty page when no failed holders exist", async () => {
      const pageOptions: PageOptions = {
        page: 1,
        limit: 10,
        order: { order: "DESC", orderBy: "createdAt" },
      }

      const expectedPage: Page<Holder> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      holderRepositoryMock.getHoldersByDistributionId.mockResolvedValue(expectedPage)

      const result = await getDistributionHoldersUseCase.execute(distributionId, pageOptions)

      expect(result).toEqual(expectedPage)
      expect(holderRepositoryMock.getHoldersByDistributionId).toHaveBeenCalledWith(distributionId, pageOptions)
    })

    it("should handle different page options", async () => {
      const pageOptions: PageOptions = {
        page: 2,
        limit: 5,
        order: { order: "ASC", orderBy: "status" },
      }

      const expectedPage: Page<Holder> = {
        items: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      }

      holderRepositoryMock.getHoldersByDistributionId.mockResolvedValue(expectedPage)

      const result = await getDistributionHoldersUseCase.execute(distributionId, pageOptions)

      expect(result).toEqual(expectedPage)
      expect(holderRepositoryMock.getHoldersByDistributionId).toHaveBeenCalledWith(distributionId, pageOptions)
    })
  })
})
