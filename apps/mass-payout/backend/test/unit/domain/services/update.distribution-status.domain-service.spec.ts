// SPDX-License-Identifier: Apache-2.0

import { BatchPayoutStatus } from "@domain/model/batch-payout"
import { DistributionStatus } from "@domain/model/distribution"
import { HolderStatus } from "@domain/model/holder"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { UpdateDistributionStatusDomainService } from "@domain/services/update-distribution-status.domain-service"
import { createMock, DeepMocked } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { HolderUtils } from "@test/shared/holder.utils"

describe(UpdateDistributionStatusDomainService.name, () => {
  let service: UpdateDistributionStatusDomainService
  let distributionRepositoryMock: DeepMocked<DistributionRepository>
  let batchPayoutRepositoryMock: DeepMocked<BatchPayoutRepository>
  let holderRepositoryMock: DeepMocked<HolderRepository>

  beforeEach(async () => {
    distributionRepositoryMock = createMock<DistributionRepository>()
    batchPayoutRepositoryMock = createMock<BatchPayoutRepository>()
    holderRepositoryMock = createMock<HolderRepository>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateDistributionStatusDomainService,
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
        {
          provide: "BatchPayoutRepository",
          useValue: batchPayoutRepositoryMock,
        },
        {
          provide: "HolderRepository",
          useValue: holderRepositoryMock,
        },
      ],
    }).compile()

    service = module.get<UpdateDistributionStatusDomainService>(UpdateDistributionStatusDomainService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    describe("when there are no batch payouts", () => {
      it("should return the distribution without changes", async () => {
        const originalDistribution = DistributionUtils.newInstance()
        batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue([])

        const result = await service.execute(originalDistribution)

        expect(result).toBe(originalDistribution)
        expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).toHaveBeenCalledTimes(1)
        expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).toHaveBeenCalledWith(originalDistribution)
        expect(distributionRepositoryMock.updateDistribution).not.toHaveBeenCalled()
        expect(holderRepositoryMock.getAllHoldersByDistributionId).not.toHaveBeenCalled()
      })
    })

    describe("when all batch payouts are completed", () => {
      it("should update distribution status to COMPLETED", async () => {
        const originalDistribution = DistributionUtils.newInstance()
        const completedBatchPayouts = [
          BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.COMPLETED }),
          BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.COMPLETED }),
        ]
        const expectedDistribution = DistributionUtils.newInstance({ status: DistributionStatus.COMPLETED })

        batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue(completedBatchPayouts)
        distributionRepositoryMock.updateDistribution.mockResolvedValue(expectedDistribution)

        const result = await service.execute(originalDistribution)

        expect(result).toEqual(expectedDistribution)
        expect(result.status).toBe(DistributionStatus.COMPLETED)
        expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).toHaveBeenCalledWith(originalDistribution)
        expect(distributionRepositoryMock.updateDistribution).toHaveBeenCalled()
      })
    })

    describe("when there are failed holders", () => {
      it("should update distribution status to FAILED when there are failed holders", async () => {
        const originalDistribution = DistributionUtils.newInstance()
        const batchPayouts = [
          BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.COMPLETED }),
          BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS }),
        ]
        const holders = [HolderUtils.newInstance({ status: HolderStatus.FAILED })]
        const expectedDistribution = DistributionUtils.newInstance({ status: DistributionStatus.FAILED })

        batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue(batchPayouts)
        holderRepositoryMock.getAllHoldersByDistributionId.mockResolvedValue(holders)
        distributionRepositoryMock.updateDistribution.mockResolvedValue(expectedDistribution)

        const result = await service.execute(originalDistribution)

        expect(result).toEqual(expectedDistribution)
        expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).toHaveBeenCalledWith(originalDistribution)
        expect(holderRepositoryMock.getAllHoldersByDistributionId).toHaveBeenCalledWith(originalDistribution.id)
        expect(distributionRepositoryMock.updateDistribution).toHaveBeenCalled()
      })
    })

    describe("when there are in progress batch payouts without failed holders", () => {
      it("should update distribution status to IN_PROGRESS", async () => {
        const originalDistribution = DistributionUtils.newInstance()
        const batchPayouts = [
          BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.COMPLETED }),
          BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS }),
        ]
        const holders = [HolderUtils.newInstance({ status: HolderStatus.PENDING })]
        const expectedDistribution = DistributionUtils.newInstance({ status: DistributionStatus.IN_PROGRESS })

        batchPayoutRepositoryMock.getBatchPayoutsByDistribution.mockResolvedValue(batchPayouts)
        holderRepositoryMock.getAllHoldersByDistributionId.mockResolvedValue(holders)
        distributionRepositoryMock.updateDistribution.mockResolvedValue(expectedDistribution)

        const result = await service.execute(originalDistribution)

        expect(result).toEqual(expectedDistribution)
        expect(batchPayoutRepositoryMock.getBatchPayoutsByDistribution).toHaveBeenCalledWith(originalDistribution)
        expect(holderRepositoryMock.getAllHoldersByDistributionId).toHaveBeenCalledWith(originalDistribution.id)
        expect(distributionRepositoryMock.updateDistribution).toHaveBeenCalled()
      })
    })
  })
})
