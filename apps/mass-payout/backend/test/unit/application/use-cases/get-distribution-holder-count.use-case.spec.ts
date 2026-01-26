// SPDX-License-Identifier: Apache-2.0

import { GetDistributionHoldersUseCase } from "@application/use-cases/get-distribution-holders.use-case"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { GetDistributionHolderCountUseCase } from "@application/use-cases/get-distribution-holder-count.use-case"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { DistributionNotFoundError } from "@domain/errors/distribution.error"

describe(GetDistributionHoldersUseCase.name, () => {
  let getDistributionHolderCountUseCase: GetDistributionHolderCountUseCase
  const holderRepositoryMock = createMock<HolderRepository>()
  const distributionRepositoryMock = createMock<DistributionRepository>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetDistributionHolderCountUseCase,
          useFactory: (distributionRepository: DistributionRepository, holderRepository: HolderRepository) => {
            return new GetDistributionHolderCountUseCase(distributionRepository, holderRepository)
          },
          inject: ["DistributionRepository", "HolderRepository"],
        },
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
        {
          provide: "HolderRepository",
          useValue: holderRepositoryMock,
        },
      ],
    }).compile()

    getDistributionHolderCountUseCase = module.get<GetDistributionHolderCountUseCase>(GetDistributionHolderCountUseCase)

    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should return holder count", async () => {
      const distribution = DistributionUtils.newInstance()
      const expectedCount = 2

      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      holderRepositoryMock.countHoldersByDistributionId.mockResolvedValue(expectedCount)

      const result = await getDistributionHolderCountUseCase.execute(distribution.id)

      expect(result).toEqual(expectedCount)
    })

    it("should throw DistributionNotFoundError when distribution does not exist", async () => {
      distributionRepositoryMock.getDistribution.mockResolvedValue(null)

      const result = await await expect(
        getDistributionHolderCountUseCase.execute("testDistributionId"),
      ).rejects.toThrow(DistributionNotFoundError)
    })
  })
})
