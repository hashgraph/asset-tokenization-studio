// SPDX-License-Identifier: Apache-2.0
import { Distribution, DistributionStatus, DistributionType, PayoutSubtype } from "@domain/model/distribution"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import {
  CancelDistributionCommand,
  CancelDistributionUseCase,
} from "@application/use-cases/cancel-distribution.use-case"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { faker } from "@faker-js/faker"
import {
  DistributionNotFoundError,
  DistributionNotInStatusError,
  DistributionNotPayoutError,
} from "@domain/errors/distribution.error"

describe("CancelDistributionUseCase", () => {
  let useCase: CancelDistributionUseCase
  const distributionRepositoryMock = createMock<DistributionRepository>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelDistributionUseCase,
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
      ],
    }).compile()

    useCase = module.get<CancelDistributionUseCase>(CancelDistributionUseCase)
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should cancel payout distribution", async () => {
      const distribution: Distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.ONE_OFF,
        } as any,
      })
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      const command: CancelDistributionCommand = {
        distributionId: distribution.id,
      }

      await useCase.execute(command)

      expect(distributionRepositoryMock.getDistribution).toHaveBeenCalledWith(distribution.id)
      expect(distributionRepositoryMock.getDistribution).toHaveBeenCalledTimes(1)
      expect(distributionRepositoryMock.updateDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          status: DistributionStatus.CANCELLED,
        }),
      )
      expect(distributionRepositoryMock.updateDistribution).toHaveBeenCalledTimes(1)
    })

    it("should throw DistributionNotFoundError when distribution does not exist", async () => {
      distributionRepositoryMock.getDistribution.mockResolvedValue(undefined)
      const command: CancelDistributionCommand = {
        distributionId: faker.string.uuid(),
      }

      await expect(useCase.execute(command)).rejects.toThrow(DistributionNotFoundError)
    })

    it("should throw DistributionNotPayoutError when distribution is not a payout", async () => {
      const distribution: Distribution = DistributionUtils.newInstance()
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      const command: CancelDistributionCommand = {
        distributionId: distribution.id,
      }

      await expect(useCase.execute(command)).rejects.toThrow(DistributionNotPayoutError)
    })

    it("should throw DistributionNotInStatusError when distribution is not in SCHEDULED status", async () => {
      const distribution: Distribution = DistributionUtils.newInstance({
        status: DistributionStatus.IN_PROGRESS,
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.ONE_OFF,
        } as any,
      })
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)
      const command: CancelDistributionCommand = {
        distributionId: distribution.id,
      }

      await expect(useCase.execute(command)).rejects.toThrow(DistributionNotInStatusError)
    })
  })
})
