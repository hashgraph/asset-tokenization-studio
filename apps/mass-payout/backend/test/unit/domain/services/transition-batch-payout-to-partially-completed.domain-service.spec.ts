// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { TransitionBatchPayoutToPartiallyCompletedDomainService } from "@domain/services/transition-batch-payout-to-partially-completed.domain-service"
import { UpdateDistributionStatusDomainService } from "@domain/services/update-distribution-status.domain-service"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { createMock, DeepMocked } from "@golevelup/ts-jest"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { BatchPayoutStatus } from "@domain/model/batch-payout"

describe(TransitionBatchPayoutToPartiallyCompletedDomainService.name, () => {
  let service: TransitionBatchPayoutToPartiallyCompletedDomainService
  let batchPayoutRepositoryMock: DeepMocked<BatchPayoutRepository>
  let updateDistributionStatusDomainServiceMock: DeepMocked<UpdateDistributionStatusDomainService>

  beforeEach(async () => {
    batchPayoutRepositoryMock = createMock<BatchPayoutRepository>()
    updateDistributionStatusDomainServiceMock = createMock<UpdateDistributionStatusDomainService>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransitionBatchPayoutToPartiallyCompletedDomainService,
        {
          provide: "BatchPayoutRepository",
          useValue: batchPayoutRepositoryMock,
        },
        {
          provide: "UpdateDistributionStatusDomainService",
          useValue: updateDistributionStatusDomainServiceMock,
        },
      ],
    }).compile()

    service = module.get<TransitionBatchPayoutToPartiallyCompletedDomainService>(
      TransitionBatchPayoutToPartiallyCompletedDomainService,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    describe("when batch payout can transition to PARTIALLY_COMPLETED", () => {
      it("should transition IN_PROGRESS batch payout to PARTIALLY_COMPLETED", async () => {
        const originalBatchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS })
        const expectedBatchPayout = BatchPayoutUtils.newInstance({
          ...originalBatchPayout,
          status: BatchPayoutStatus.PARTIALLY_COMPLETED,
        })
        batchPayoutRepositoryMock.saveBatchPayout.mockResolvedValue(expectedBatchPayout)

        const result = await service.execute(originalBatchPayout)

        expect(batchPayoutRepositoryMock.saveBatchPayout).toHaveBeenCalledWith(
          expect.objectContaining({
            id: originalBatchPayout.id,
            status: BatchPayoutStatus.PARTIALLY_COMPLETED,
          }),
        )
        expect(updateDistributionStatusDomainServiceMock.execute).toHaveBeenCalledWith(expectedBatchPayout.distribution)
        expect(result).toEqual(expectedBatchPayout)
      })

      it("should transition PARTIALLY_COMPLETED batch payout to PARTIALLY_COMPLETED", async () => {
        const originalBatchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.PARTIALLY_COMPLETED })
        const expectedBatchPayout = BatchPayoutUtils.newInstance({
          ...originalBatchPayout,
          status: BatchPayoutStatus.PARTIALLY_COMPLETED,
        })
        batchPayoutRepositoryMock.saveBatchPayout.mockResolvedValue(expectedBatchPayout)

        const result = await service.execute(originalBatchPayout)

        expect(batchPayoutRepositoryMock.saveBatchPayout).toHaveBeenCalledWith(
          expect.objectContaining({
            id: originalBatchPayout.id,
            status: BatchPayoutStatus.PARTIALLY_COMPLETED,
          }),
        )
        expect(updateDistributionStatusDomainServiceMock.execute).toHaveBeenCalledWith(expectedBatchPayout.distribution)
        expect(result).toEqual(expectedBatchPayout)
      })
    })

    describe("when batch payout cannot transition to PARTIALLY_COMPLETED", () => {
      it("should not modify COMPLETED batch payout and not update distribution", async () => {
        const originalBatchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.COMPLETED })

        const result = await service.execute(originalBatchPayout)

        expect(batchPayoutRepositoryMock.saveBatchPayout).not.toHaveBeenCalled()
        expect(updateDistributionStatusDomainServiceMock.execute).not.toHaveBeenCalled()
        expect(result).toBe(originalBatchPayout)
      })

      it("should not modify FAILED batch payout and not update distribution", async () => {
        const originalBatchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.FAILED })

        const result = await service.execute(originalBatchPayout)

        expect(batchPayoutRepositoryMock.saveBatchPayout).not.toHaveBeenCalled()
        expect(updateDistributionStatusDomainServiceMock.execute).not.toHaveBeenCalled()
        expect(result).toBe(originalBatchPayout)
      })
    })
  })
})
