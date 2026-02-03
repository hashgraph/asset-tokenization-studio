// SPDX-License-Identifier: Apache-2.0

import { BatchPayoutStatus } from "@domain/model/batch-payout"
import { Distribution, DistributionStatus, DistributionType, PayoutSubtype } from "@domain/model/distribution"
import { HolderStatus } from "@domain/model/holder"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class UpdateDistributionStatusDomainService {
  constructor(
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
    @Inject("BatchPayoutRepository")
    private readonly batchPayoutRepository: BatchPayoutRepository,
    @Inject("HolderRepository")
    private readonly holderRepository: HolderRepository,
  ) {}

  async execute(distribution: Distribution): Promise<Distribution> {
    const batchPayouts = await this.batchPayoutRepository.getBatchPayoutsByDistribution(distribution)
    if (batchPayouts.length === 0) {
      return distribution
    }

    const areAllBatchPayoutsCompleted = batchPayouts.every((p) => p.status === BatchPayoutStatus.COMPLETED)

    if (areAllBatchPayoutsCompleted) {
      distribution = this.setDistributionStatusToCompleted(distribution)
    } else {
      const distributionWithUpdatedStatus = await this.determineStatusFromHolders(distribution)
      distribution = distributionWithUpdatedStatus
    }
    return await this.distributionRepository.updateDistribution(distribution)
  }

  private async determineStatusFromHolders(distribution: Distribution): Promise<Distribution> {
    const holders = await this.holderRepository.getAllHoldersByDistributionId(distribution.id)
    const hasAnyHolder = holders.some((holder) => holder.status === HolderStatus.FAILED)

    if (hasAnyHolder) {
      return this.setDistributionStatusToFailed(distribution)
    } else {
      if (distribution.status !== DistributionStatus.IN_PROGRESS) {
        return this.setDistributionStatusToInProgress(distribution)
      } else {
        return distribution
      }
    }
  }

  public setDistributionStatusToInProgress(distribution: Distribution): Distribution {
    if (distribution.details.type === DistributionType.CORPORATE_ACTION) {
      return Distribution.createExistingCorporateAction(
        distribution.id,
        distribution.asset,
        distribution.details.corporateActionId,
        distribution.details.executionDate,
        DistributionStatus.IN_PROGRESS,
        distribution.createdAt,
        new Date(),
      )
    } else if (distribution.details.type === DistributionType.PAYOUT) {
      if (distribution.details.subtype === PayoutSubtype.IMMEDIATE) {
        return Distribution.createExistingImmediate(
          distribution.id,
          distribution.asset,
          distribution.details.snapshotId,
          DistributionStatus.IN_PROGRESS,
          distribution.createdAt,
          new Date(),
          distribution.details.amount,
          distribution.details.amountType,
          distribution.details.concept,
        )
      } else if (distribution.details.subtype === PayoutSubtype.ONE_OFF) {
        return Distribution.createExistingOneOff(
          distribution.id,
          distribution.asset,
          distribution.details.snapshotId,
          distribution.details.executeAt,
          DistributionStatus.IN_PROGRESS,
          distribution.details.amount,
          distribution.details.amountType,
          distribution.createdAt,
          new Date(),
          distribution.details.concept,
        )
      } else if (distribution.details.subtype === PayoutSubtype.RECURRING) {
        return Distribution.createExistingRecurring(
          distribution.id,
          distribution.asset,
          distribution.details.executeAt,
          distribution.details.recurrency,
          distribution.details.amount,
          distribution.details.amountType,
          distribution.details.snapshotId,
          DistributionStatus.IN_PROGRESS,
          distribution.createdAt,
          new Date(),
          distribution.details.concept,
        )
      } else if (distribution.details.subtype === PayoutSubtype.AUTOMATED) {
        return Distribution.createExistingAutomated(
          distribution.id,
          distribution.asset,
          distribution.details.amount,
          distribution.details.amountType,
          distribution.details.concept,
          distribution.details.snapshotId,
          DistributionStatus.IN_PROGRESS,
          distribution.createdAt,
          new Date(),
        )
      }
    }
  }

  private setDistributionStatusToFailed(distribution: Distribution): Distribution {
    if (distribution.details.type === DistributionType.CORPORATE_ACTION) {
      return Distribution.createExistingCorporateAction(
        distribution.id,
        distribution.asset,
        distribution.details.corporateActionId,
        distribution.details.executionDate,
        DistributionStatus.FAILED,
        distribution.createdAt,
        new Date(),
      )
    } else if (distribution.details.type === DistributionType.PAYOUT) {
      if (distribution.details.subtype === PayoutSubtype.IMMEDIATE) {
        return Distribution.createExistingImmediate(
          distribution.id,
          distribution.asset,
          distribution.details.snapshotId,
          DistributionStatus.FAILED,
          distribution.createdAt,
          new Date(),
          distribution.details.amount,
          distribution.details.amountType,
          distribution.details.concept,
        )
      } else if (distribution.details.subtype === PayoutSubtype.ONE_OFF) {
        return Distribution.createExistingOneOff(
          distribution.id,
          distribution.asset,
          distribution.details.snapshotId,
          distribution.details.executeAt,
          DistributionStatus.FAILED,
          distribution.details.amount,
          distribution.details.amountType,
          distribution.createdAt,
          new Date(),
          distribution.details.concept,
        )
      } else if (distribution.details.subtype === PayoutSubtype.RECURRING) {
        return Distribution.createExistingRecurring(
          distribution.id,
          distribution.asset,
          distribution.details.executeAt,
          distribution.details.recurrency,
          distribution.details.amount,
          distribution.details.amountType,
          distribution.details.snapshotId,
          DistributionStatus.FAILED,
          distribution.createdAt,
          new Date(),
          distribution.details.concept,
        )
      } else if (distribution.details.subtype === PayoutSubtype.AUTOMATED) {
        return Distribution.createExistingAutomated(
          distribution.id,
          distribution.asset,
          distribution.details.amount,
          distribution.details.amountType,
          distribution.details.concept,
          distribution.details.snapshotId,
          DistributionStatus.FAILED,
          distribution.createdAt,
          new Date(),
        )
      }
    }
  }

  private setDistributionStatusToCompleted(distribution: Distribution): Distribution {
    if (distribution.details.type === DistributionType.CORPORATE_ACTION) {
      return Distribution.createExistingCorporateAction(
        distribution.id,
        distribution.asset,
        distribution.details.corporateActionId,
        distribution.details.executionDate,
        DistributionStatus.COMPLETED,
        distribution.createdAt,
        new Date(),
      )
    } else if (distribution.details.type === DistributionType.PAYOUT) {
      if (distribution.details.subtype === PayoutSubtype.IMMEDIATE) {
        return Distribution.createExistingImmediate(
          distribution.id,
          distribution.asset,
          distribution.details.snapshotId,
          DistributionStatus.COMPLETED,
          distribution.createdAt,
          new Date(),
          distribution.details.amount,
          distribution.details.amountType,
          distribution.details.concept,
        )
      } else if (distribution.details.subtype === PayoutSubtype.ONE_OFF) {
        return Distribution.createExistingOneOff(
          distribution.id,
          distribution.asset,
          distribution.details.snapshotId,
          distribution.details.executeAt,
          DistributionStatus.COMPLETED,
          distribution.details.amount,
          distribution.details.amountType,
          distribution.createdAt,
          new Date(),
          distribution.details.concept,
        )
      } else if (distribution.details.subtype === PayoutSubtype.RECURRING) {
        return Distribution.createExistingRecurring(
          distribution.id,
          distribution.asset,
          distribution.details.executeAt,
          distribution.details.recurrency,
          distribution.details.amount,
          distribution.details.amountType,
          distribution.details.snapshotId,
          DistributionStatus.COMPLETED,
          distribution.createdAt,
          new Date(),
          distribution.details.concept,
        )
      } else if (distribution.details.subtype === PayoutSubtype.AUTOMATED) {
        return Distribution.createExistingAutomated(
          distribution.id,
          distribution.asset,
          distribution.details.amount,
          distribution.details.amountType,
          distribution.details.concept,
          distribution.details.snapshotId,
          DistributionStatus.COMPLETED,
          distribution.createdAt,
          new Date(),
        )
      }
    }
  }
}
