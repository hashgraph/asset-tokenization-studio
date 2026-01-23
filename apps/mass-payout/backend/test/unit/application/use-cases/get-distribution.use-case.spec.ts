// SPDX-License-Identifier: Apache-2.0

import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { GetDistributionUseCase } from "@application/use-cases/get-distribution.use-case"
import { DistributionNotFoundError } from "@domain/errors/distribution.error"
import { AssetUtils } from "@test/shared/asset.utils"

describe(GetDistributionUseCase.name, () => {
  let getDistributionUseCase: GetDistributionUseCase
  const distributionRepositoryMock = createMock<DistributionRepository>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetDistributionUseCase,
          useFactory: (distributionRepository: DistributionRepository) => {
            return new GetDistributionUseCase(distributionRepository)
          },
          inject: ["DistributionRepository"],
        },
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
      ],
    }).compile()

    getDistributionUseCase = module.get<GetDistributionUseCase>(GetDistributionUseCase)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should return distribution when found", async () => {
      const asset = AssetUtils.newInstance()
      const distribution = DistributionUtils.newInstance({ asset })
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)

      const result = await getDistributionUseCase.execute(distribution.id)

      expect(result).toBe(distribution)
      expect(distributionRepositoryMock.getDistribution).toHaveBeenCalledWith(distribution.id)
    })

    it("should throw DistributionNotFoundError when distribution is not found", async () => {
      const distributionId = "non-existent-id"
      distributionRepositoryMock.getDistribution.mockResolvedValue(null)

      await expect(getDistributionUseCase.execute(distributionId)).rejects.toThrow(
        new DistributionNotFoundError(distributionId),
      )
      expect(distributionRepositoryMock.getDistribution).toHaveBeenCalledWith(distributionId)
    })

    it("should propagate repository errors", async () => {
      const distributionId = "some-id"
      const repositoryError = new Error("Repository error")
      distributionRepositoryMock.getDistribution.mockRejectedValue(repositoryError)

      await expect(getDistributionUseCase.execute(distributionId)).rejects.toThrow(repositoryError)
      expect(distributionRepositoryMock.getDistribution).toHaveBeenCalledWith(distributionId)
    })
  })
})
