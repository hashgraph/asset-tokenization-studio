// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { UpdateBatchPayoutStatusDomainService } from "@domain/services/update-batch-payout-status.domain-service"
import { UpdateDistributionStatusDomainService } from "@domain/services/update-distribution-status.domain-service"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { createMock, DeepMocked } from "@golevelup/ts-jest"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { HolderUtils } from "@test/shared/holder.utils"
import { BatchPayoutStatus } from "@domain/model/batch-payout"
import { HolderStatus } from "@domain/model/holder"

describe(UpdateBatchPayoutStatusDomainService.name, () => {
  let service: UpdateBatchPayoutStatusDomainService
  let batchPayoutRepositoryMock: DeepMocked<BatchPayoutRepository>
  let holderRepositoryMock: DeepMocked<HolderRepository>
  let updateDistributionStatusDomainServiceMock: DeepMocked<UpdateDistributionStatusDomainService>

  beforeEach(async () => {
    batchPayoutRepositoryMock = createMock<BatchPayoutRepository>()
    holderRepositoryMock = createMock<HolderRepository>()
    updateDistributionStatusDomainServiceMock = createMock<UpdateDistributionStatusDomainService>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBatchPayoutStatusDomainService,
        {
          provide: "BatchPayoutRepository",
          useValue: batchPayoutRepositoryMock,
        },
        {
          provide: "HolderRepository",
          useValue: holderRepositoryMock,
        },
        {
          provide: "UpdateDistributionStatusDomainService",
          useValue: updateDistributionStatusDomainServiceMock,
        },
      ],
    }).compile()

    service = module.get<UpdateBatchPayoutStatusDomainService>(UpdateBatchPayoutStatusDomainService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    describe("when there are failed holders with FAILED status", () => {
      it("should update batch payout status to FAILED and update distribution status", async () => {
        const originalBatchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS })
        const holders = [
          HolderUtils.newInstance({
            batchPayout: originalBatchPayout,
            status: HolderStatus.FAILED,
          }),
          HolderUtils.newInstance({
            batchPayout: originalBatchPayout,
            status: HolderStatus.SUCCESS,
          }),
        ]
        const expectedBatchPayout = BatchPayoutUtils.newInstance({
          ...originalBatchPayout,
          status: BatchPayoutStatus.FAILED,
        })
        holderRepositoryMock.getHoldersByBatchPayout.mockResolvedValue(holders)
        batchPayoutRepositoryMock.updateBatchPayout.mockResolvedValue(expectedBatchPayout)

        const result = await service.execute(originalBatchPayout)

        expect(holderRepositoryMock.getHoldersByBatchPayout).toHaveBeenCalledWith(originalBatchPayout.id)
        expect(batchPayoutRepositoryMock.updateBatchPayout).toHaveBeenCalledWith(
          expect.objectContaining({
            id: originalBatchPayout.id,
            status: BatchPayoutStatus.FAILED,
          }),
        )
        expect(updateDistributionStatusDomainServiceMock.execute).toHaveBeenCalledWith(originalBatchPayout.distribution)
        expect(result).toEqual(expectedBatchPayout)
      })
    })

    describe("when all failed holders have SUCCESS status", () => {
      it("should update batch payout status to COMPLETED and update distribution status", async () => {
        const originalBatchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS })
        const holders = [
          HolderUtils.newInstance({
            batchPayout: originalBatchPayout,
            status: HolderStatus.SUCCESS,
          }),
          HolderUtils.newInstance({
            batchPayout: originalBatchPayout,
            status: HolderStatus.SUCCESS,
          }),
        ]
        const expectedBatchPayout = BatchPayoutUtils.newInstance({
          ...originalBatchPayout,
          status: BatchPayoutStatus.COMPLETED,
        })
        holderRepositoryMock.getHoldersByBatchPayout.mockResolvedValue(holders)
        batchPayoutRepositoryMock.updateBatchPayout.mockResolvedValue(expectedBatchPayout)

        const result = await service.execute(originalBatchPayout)

        expect(holderRepositoryMock.getHoldersByBatchPayout).toHaveBeenCalledWith(originalBatchPayout.id)
        expect(batchPayoutRepositoryMock.updateBatchPayout).toHaveBeenCalledWith(
          expect.objectContaining({
            id: originalBatchPayout.id,
            status: BatchPayoutStatus.COMPLETED,
          }),
        )
        expect(updateDistributionStatusDomainServiceMock.execute).toHaveBeenCalledWith(originalBatchPayout.distribution)
        expect(result).toEqual(expectedBatchPayout)
      })
    })

    describe("when failed holders have mixed statuses without FAILED", () => {
      it("should not change batch payout status but still update distribution status", async () => {
        const originalBatchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS })
        const holders = [
          HolderUtils.newInstance({
            batchPayout: originalBatchPayout,
            status: HolderStatus.PENDING,
          }),
          HolderUtils.newInstance({
            batchPayout: originalBatchPayout,
            status: HolderStatus.SUCCESS,
          }),
        ]
        holderRepositoryMock.getHoldersByBatchPayout.mockResolvedValue(holders)
        batchPayoutRepositoryMock.updateBatchPayout.mockResolvedValue(originalBatchPayout)

        const result = await service.execute(originalBatchPayout)

        expect(holderRepositoryMock.getHoldersByBatchPayout).toHaveBeenCalledWith(originalBatchPayout.id)
        expect(batchPayoutRepositoryMock.updateBatchPayout).toHaveBeenCalledWith(originalBatchPayout)
        expect(updateDistributionStatusDomainServiceMock.execute).toHaveBeenCalledWith(originalBatchPayout.distribution)
        expect(result).toEqual(originalBatchPayout)
      })
    })

    describe("when there are no failed holders", () => {
      it("should update batch payout status to COMPLETED and update distribution status", async () => {
        const originalBatchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS })
        const holders = []
        const expectedBatchPayout = BatchPayoutUtils.newInstance({
          ...originalBatchPayout,
          status: BatchPayoutStatus.COMPLETED,
        })
        holderRepositoryMock.getHoldersByBatchPayout.mockResolvedValue(holders)
        batchPayoutRepositoryMock.updateBatchPayout.mockResolvedValue(expectedBatchPayout)

        const result = await service.execute(originalBatchPayout)

        expect(holderRepositoryMock.getHoldersByBatchPayout).toHaveBeenCalledWith(originalBatchPayout.id)
        expect(batchPayoutRepositoryMock.updateBatchPayout).toHaveBeenCalledWith(
          expect.objectContaining({
            id: originalBatchPayout.id,
            status: BatchPayoutStatus.COMPLETED,
          }),
        )
        expect(updateDistributionStatusDomainServiceMock.execute).toHaveBeenCalledWith(originalBatchPayout.distribution)
        expect(result).toEqual(expectedBatchPayout)
      })
    })

    describe("when all failed holders have PENDING status", () => {
      it("should not change batch payout status but still update distribution status", async () => {
        const originalBatchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS })
        const holders = [
          HolderUtils.newInstance({
            batchPayout: originalBatchPayout,
            status: HolderStatus.PENDING,
          }),
          HolderUtils.newInstance({
            batchPayout: originalBatchPayout,
            status: HolderStatus.PENDING,
          }),
        ]
        holderRepositoryMock.getHoldersByBatchPayout.mockResolvedValue(holders)
        batchPayoutRepositoryMock.updateBatchPayout.mockResolvedValue(originalBatchPayout)

        const result = await service.execute(originalBatchPayout)

        expect(holderRepositoryMock.getHoldersByBatchPayout).toHaveBeenCalledWith(originalBatchPayout.id)
        expect(batchPayoutRepositoryMock.updateBatchPayout).toHaveBeenCalledWith(originalBatchPayout)
        expect(updateDistributionStatusDomainServiceMock.execute).toHaveBeenCalledWith(originalBatchPayout.distribution)
        expect(result).toEqual(originalBatchPayout)
      })
    })
  })
})
