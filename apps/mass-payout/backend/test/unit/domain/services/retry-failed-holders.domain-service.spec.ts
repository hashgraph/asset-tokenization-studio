// SPDX-License-Identifier: Apache-2.0

import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import { RetryFailedHoldersDomainService } from "@domain/services/retry-failed-holders.domain-service"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { HolderUtils } from "@test/shared/holder.utils"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { BatchPayoutStatus } from "@domain/model/batch-payout"
import { HolderStatus } from "@domain/model/holder"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { AmountType, DistributionStatus, DistributionType, PayoutSubtype } from "@domain/model/distribution"
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { DistributionNotFoundError, DistributionNotInStatusError } from "@domain/errors/distribution.error"
import { UpdateBatchPayoutStatusDomainService } from "@domain/services/update-batch-payout-status.domain-service"

describe(RetryFailedHoldersDomainService.name, () => {
  let retryFailedHoldersDomainService: RetryFailedHoldersDomainService
  const distributionRepositoryMock = createMock<DistributionRepository>()
  const holderRepositoryMock = createMock<HolderRepository>()
  const onChainLifeCycleCashFlowServiceMock = createMock<LifeCycleCashFlowPort>()
  const updateBatchPayoutStatusDomainServiceMock = createMock<UpdateBatchPayoutStatusDomainService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryFailedHoldersDomainService,
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
        {
          provide: "HolderRepository",
          useValue: holderRepositoryMock,
        },
        {
          provide: "OnChainLifeCycleCashFlowService",
          useValue: onChainLifeCycleCashFlowServiceMock,
        },
        {
          provide: "UpdateBatchPayoutStatusDomainService",
          useValue: updateBatchPayoutStatusDomainServiceMock,
        },
      ],
    }).compile()

    retryFailedHoldersDomainService = module.get<RetryFailedHoldersDomainService>(RetryFailedHoldersDomainService)

    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should retry failed holders for a corporate action distribution", async () => {
      const batchPayout = BatchPayoutUtils.newInstance({
        status: BatchPayoutStatus.IN_PROGRESS,
        distribution: DistributionUtils.newInstance({ status: DistributionStatus.FAILED }),
      })
      const holders = [
        HolderUtils.newInstance({
          batchPayout: batchPayout,
          status: HolderStatus.FAILED,
        }),
        HolderUtils.newInstance({
          batchPayout: batchPayout,
          status: HolderStatus.FAILED,
        }),
      ]
      const distribution = batchPayout.distribution
      const corporateActionId = Number((distribution.details as any).corporateActionId.value)
      const asset = batchPayout.distribution.asset
      const holderAccounts = holders.map((holder) => holder.holderEvmAddress)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const executeDistributionResponse = {
        failed: [],
        succeeded: holderAccounts,
        paidAmount: [amount, amount],
        transactionId: "0.0.456@1234567891.987654321",
      } as any

      distributionRepositoryMock.getDistribution.mockResolvedValue(batchPayout.distribution)
      holderRepositoryMock.getHoldersByDistributionIdAndStatus.mockResolvedValue(holders)
      onChainLifeCycleCashFlowServiceMock.executeDistributionByAddresses.mockResolvedValue(executeDistributionResponse)

      await retryFailedHoldersDomainService.execute(batchPayout.distribution.id)

      expect(distributionRepositoryMock.getDistribution).toHaveBeenCalledWith(batchPayout.distribution.id)
      expect(holderRepositoryMock.getHoldersByDistributionIdAndStatus).toHaveBeenCalledWith(
        batchPayout.distribution.id,
        HolderStatus.FAILED,
      )
      expect(holderRepositoryMock.saveHolders).toHaveBeenCalledTimes(2)
      holders.forEach((holder) => holder.retrying())
      expect(holderRepositoryMock.saveHolders).toHaveBeenNthCalledWith(1, holders)
      holders.forEach((holder) => holder.succeed(amount))
      expect(holderRepositoryMock.saveHolders).toHaveBeenNthCalledWith(2, holders)
      expect(onChainLifeCycleCashFlowServiceMock.executeDistributionByAddresses).toHaveBeenCalledWith(
        asset.lifeCycleCashFlowHederaAddress,
        asset.hederaTokenAddress,
        corporateActionId,
        holderAccounts,
      )
      expect(updateBatchPayoutStatusDomainServiceMock.execute).toHaveBeenCalledWith(batchPayout)
    })

    it("should retry failed holders for a payout with amount type fixed distribution", async () => {
      const distribution = DistributionUtils.newInstance({
        status: DistributionStatus.FAILED,
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
          snapshotId: SnapshotId.create("some-snapshot-id"),
        },
      })
      const batchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS, distribution })
      const holders = [
        HolderUtils.newInstance({
          batchPayout: batchPayout,
          status: HolderStatus.FAILED,
        }),
        HolderUtils.newInstance({
          batchPayout: batchPayout,
          status: HolderStatus.FAILED,
        }),
      ]
      const snapshotId = Number((distribution.details as any).snapshotId.value)
      const asset = batchPayout.distribution.asset
      const holderAccounts = holders.map((holder) => holder.holderEvmAddress)
      const executeDistributionResponse = {
        failed: holderAccounts,
        succeeded: [],
        paidAmount: [],
        transactionId: "0.0.456@1234567891.987654321",
      } as any

      distributionRepositoryMock.getDistribution.mockResolvedValue(batchPayout.distribution)
      holderRepositoryMock.getHoldersByDistributionIdAndStatus.mockResolvedValue(holders)
      onChainLifeCycleCashFlowServiceMock.executeAmountSnapshotByAddresses.mockResolvedValue(
        executeDistributionResponse,
      )

      await retryFailedHoldersDomainService.execute(batchPayout.distribution.id)

      expect(distributionRepositoryMock.getDistribution).toHaveBeenCalledWith(batchPayout.distribution.id)
      expect(holderRepositoryMock.getHoldersByDistributionIdAndStatus).toHaveBeenCalledWith(
        batchPayout.distribution.id,
        HolderStatus.FAILED,
      )
      expect(holderRepositoryMock.saveHolders).toHaveBeenCalledTimes(2)
      holders.forEach((holder) => holder.retrying())
      expect(holderRepositoryMock.saveHolders).toHaveBeenNthCalledWith(1, holders)
      holders.forEach((holder) => holder.failed())
      expect(holderRepositoryMock.saveHolders).toHaveBeenNthCalledWith(2, holders)
      expect(onChainLifeCycleCashFlowServiceMock.executeAmountSnapshotByAddresses).toHaveBeenCalledWith(
        asset.lifeCycleCashFlowHederaAddress,
        asset.hederaTokenAddress,
        snapshotId,
        holderAccounts,
        (distribution.details as any).amount,
      )
      expect(updateBatchPayoutStatusDomainServiceMock.execute).toHaveBeenCalledWith(batchPayout)
    })

    it("should retry failed holders for a payout with amount type percentage distribution", async () => {
      const distribution = DistributionUtils.newInstance({
        status: DistributionStatus.FAILED,
        details: {
          type: DistributionType.PAYOUT,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.PERCENTAGE,
          snapshotId: SnapshotId.create("some-snapshot-id"),
        },
      })
      const batchPayout = BatchPayoutUtils.newInstance({ status: BatchPayoutStatus.IN_PROGRESS, distribution })
      const holders = [
        HolderUtils.newInstance({
          batchPayout: batchPayout,
          status: HolderStatus.FAILED,
        }),
        HolderUtils.newInstance({
          batchPayout: batchPayout,
          status: HolderStatus.FAILED,
        }),
      ]
      const snapshotId = Number((distribution.details as any).snapshotId.value)
      const asset = batchPayout.distribution.asset
      const holderAccounts = holders.map((holder) => holder.holderEvmAddress)
      const holderAmount = faker.number.int({ min: 1, max: 1000 }).toString()
      const executeDistributionResponse = {
        failed: [],
        succeeded: holderAccounts,
        paidAmount: [holderAmount, holderAmount],
        transactionId: "0.0.456@1234567891.987654321",
      } as any

      distributionRepositoryMock.getDistribution.mockResolvedValue(batchPayout.distribution)
      holderRepositoryMock.getHoldersByDistributionIdAndStatus.mockResolvedValue(holders)
      onChainLifeCycleCashFlowServiceMock.executePercentageSnapshotByAddresses.mockResolvedValue(
        executeDistributionResponse,
      )

      await retryFailedHoldersDomainService.execute(batchPayout.distribution.id)

      expect(distributionRepositoryMock.getDistribution).toHaveBeenCalledWith(batchPayout.distribution.id)
      expect(holderRepositoryMock.getHoldersByDistributionIdAndStatus).toHaveBeenCalledWith(
        batchPayout.distribution.id,
        HolderStatus.FAILED,
      )
      expect(holderRepositoryMock.saveHolders).toHaveBeenCalledTimes(2)
      holders.forEach((holder) => holder.retrying())
      expect(holderRepositoryMock.saveHolders).toHaveBeenNthCalledWith(1, holders)
      holders.forEach((holder) => holder.succeed(holderAmount))
      expect(holderRepositoryMock.saveHolders).toHaveBeenNthCalledWith(2, holders)
      expect(onChainLifeCycleCashFlowServiceMock.executePercentageSnapshotByAddresses).toHaveBeenCalledWith(
        asset.lifeCycleCashFlowHederaAddress,
        asset.hederaTokenAddress,
        snapshotId,
        holderAccounts,
        (distribution.details as any).amount,
      )
      expect(updateBatchPayoutStatusDomainServiceMock.execute).toHaveBeenCalledWith(batchPayout)
    })

    it("should throw DistributionNotFoundError when distribution does not exist", async () => {
      const distributionId = faker.string.uuid()
      distributionRepositoryMock.getDistribution.mockResolvedValue(undefined)

      await expect(retryFailedHoldersDomainService.execute(distributionId)).rejects.toThrow(
        new DistributionNotFoundError(distributionId),
      )
    })

    it("should throw DistributionNotInStatusError when distribution is not in FAILED status", async () => {
      const distribution = DistributionUtils.newInstance({
        status: DistributionStatus.COMPLETED,
      })
      distributionRepositoryMock.getDistribution.mockResolvedValue(distribution)

      await expect(retryFailedHoldersDomainService.execute(distribution.id)).rejects.toThrow(
        new DistributionNotInStatusError(distribution.id, DistributionStatus.FAILED),
      )
    })
  })
})
