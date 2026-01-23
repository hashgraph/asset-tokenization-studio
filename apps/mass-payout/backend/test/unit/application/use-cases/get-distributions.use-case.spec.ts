// SPDX-License-Identifier: Apache-2.0

import { GetDistributionsUseCase } from "@application/use-cases/get-distributions.use-case"
import { Distribution } from "@domain/model/distribution"
import { DistributionStatus } from "@domain/model/distribution"
import { Page } from "@domain/model/page"
import { PageOptions } from "@domain/model/page"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"

describe(GetDistributionsUseCase.name, () => {
  let getDistributionsUseCase: GetDistributionsUseCase
  const distributionRepositoryMock = createMock<DistributionRepository>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetDistributionsUseCase,
          useFactory: (distributionRepository: DistributionRepository) => {
            return new GetDistributionsUseCase(distributionRepository)
          },
          inject: ["DistributionRepository"],
        },
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
      ],
    }).compile()

    getDistributionsUseCase = module.get<GetDistributionsUseCase>(GetDistributionsUseCase)

    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should return paginated distributions when distributions exist", async () => {
      const distribution1 = DistributionUtils.newInstance({
        status: DistributionStatus.SCHEDULED,
      })
      const distribution2 = DistributionUtils.newInstance({
        status: DistributionStatus.COMPLETED,
      })

      const pageOptions: PageOptions = { page: 1, limit: 10, order: { order: "DESC", orderBy: "createdAt" } }
      const expectedPage: Page<Distribution> = {
        items: [distribution1, distribution2],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      distributionRepositoryMock.getDistributions.mockResolvedValue(expectedPage)

      const result = await getDistributionsUseCase.execute(pageOptions)

      expect(result).toEqual(expectedPage)
      expect(distributionRepositoryMock.getDistributions).toHaveBeenCalledWith(pageOptions)
    })

    it("should return empty page when no distributions exist", async () => {
      const pageOptions: PageOptions = { page: 1, limit: 10, order: { order: "DESC", orderBy: "createdAt" } }
      const expectedPage: Page<Distribution> = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 }

      distributionRepositoryMock.getDistributions.mockResolvedValue(expectedPage)

      const result = await getDistributionsUseCase.execute(pageOptions)

      expect(result).toEqual(expectedPage)
      expect(distributionRepositoryMock.getDistributions).toHaveBeenCalledWith(pageOptions)
    })

    it("should forward different page options to repository", async () => {
      const pageOptions: PageOptions = { page: 2, limit: 5, order: { order: "ASC", orderBy: "executionDate" } }
      const expectedPage: Page<Distribution> = { items: [], total: 0, page: 2, limit: 5, totalPages: 0 }

      distributionRepositoryMock.getDistributions.mockResolvedValue(expectedPage)

      const result = await getDistributionsUseCase.execute(pageOptions)

      expect(result).toEqual(expectedPage)
      expect(distributionRepositoryMock.getDistributions).toHaveBeenCalledWith(pageOptions)
    })
  })
})
