// SPDX-License-Identifier: Apache-2.0

import {
  DistributionAssetIdMissingError,
  DistributionExecutionDateInPastError,
  DistributionExecutionDateMissingError,
  DistributionNotCorporateActionError,
  DistributionNotInStatusError,
  DistributionNotPayoutError,
  DistributionRecurrencyMissingError,
} from "@domain/errors/distribution.error"
import { Asset } from "@domain/model/asset"
import { BaseEntity } from "@domain/model/base-entity"
import { isNil } from "@nestjs/common/utils/shared.utils"
import { CorporateActionId } from "./value-objects/corporate-action-id"
import { SnapshotId } from "./value-objects/snapshot-id"

export enum DistributionStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum DistributionType {
  CORPORATE_ACTION = "CORPORATE_ACTION",
  PAYOUT = "PAYOUT",
}

export enum PayoutSubtype {
  IMMEDIATE = "IMMEDIATE",
  ONE_OFF = "ONE_OFF",
  RECURRING = "RECURRING",
  AUTOMATED = "AUTOMATED",
}

export type CorporateActionDetails = {
  type: DistributionType.CORPORATE_ACTION
  corporateActionId: CorporateActionId
  executionDate: Date
}

export enum Recurrency {
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

type ImmediatePayout = {
  subtype: PayoutSubtype.IMMEDIATE
  snapshotId: SnapshotId
}

type OneOffPayout = {
  subtype: PayoutSubtype.ONE_OFF
  executeAt: Date
  snapshotId?: SnapshotId
}

type RecurringPayout = {
  subtype: PayoutSubtype.RECURRING
  executeAt: Date
  recurrency: Recurrency
  snapshotId?: SnapshotId
}

type AutomatedPayout = {
  subtype: PayoutSubtype.AUTOMATED
  snapshotId?: SnapshotId
}

export type PayoutDetails = {
  type: DistributionType.PAYOUT
  amount: string
  amountType: AmountType
  concept?: string
} & (ImmediatePayout | OneOffPayout | RecurringPayout | AutomatedPayout)

export enum AmountType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

export type DistributionDetails = CorporateActionDetails | PayoutDetails

export class Distribution extends BaseEntity {
  readonly asset: Asset
  readonly details: DistributionDetails
  status: DistributionStatus

  private constructor(
    id: string,
    asset: Asset,
    details: DistributionDetails,
    status: DistributionStatus,
    createdAt: Date = new Date(),
    updatedAt: Date = createdAt,
    isExisting: boolean = false,
  ) {
    super(id, createdAt, updatedAt)
    this.asset = asset
    this.details = details
    this.status = status
    this.validateFields(isExisting)
  }

  static createCorporateAction(
    asset: Asset,
    corporateActionId: CorporateActionId,
    executionDate: Date,
    status?: DistributionStatus,
    createdAt?: Date,
    updatedAt?: Date,
  ): Distribution {
    return new Distribution(
      crypto.randomUUID(),
      asset,
      {
        type: DistributionType.CORPORATE_ACTION,
        corporateActionId,
        executionDate,
      },
      status ?? DistributionStatus.SCHEDULED,
      createdAt,
      updatedAt,
    )
  }

  static createImmediate(
    asset: Asset,
    amount: string,
    amountType: AmountType,
    snapshotId?: SnapshotId,
    status?: DistributionStatus,
    concept?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Distribution {
    return new Distribution(
      crypto.randomUUID(),
      asset,
      {
        type: DistributionType.PAYOUT,
        subtype: PayoutSubtype.IMMEDIATE,
        snapshotId,
        amount,
        amountType,
        concept,
      },
      status ?? DistributionStatus.SCHEDULED,
      createdAt,
      updatedAt,
    )
  }

  static createOneOff(
    asset: Asset,
    executeAt: Date,
    amount: string,
    amountType: AmountType,
    snapshotId?: SnapshotId,
    status?: DistributionStatus,
    concept?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Distribution {
    return new Distribution(
      crypto.randomUUID(),
      asset,
      {
        type: DistributionType.PAYOUT,
        subtype: PayoutSubtype.ONE_OFF,
        snapshotId,
        executeAt,
        amount,
        amountType,
        concept,
      },
      status ?? DistributionStatus.SCHEDULED,
      createdAt,
      updatedAt,
    )
  }

  static createRecurring(
    asset: Asset,
    executeAt: Date,
    recurrency: Recurrency,
    amount: string,
    amountType: AmountType,
    snapshotId?: SnapshotId,
    status?: DistributionStatus,
    concept?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Distribution {
    return new Distribution(
      crypto.randomUUID(),
      asset,
      {
        type: DistributionType.PAYOUT,
        subtype: PayoutSubtype.RECURRING,
        snapshotId,
        executeAt,
        recurrency,
        amount,
        amountType,
        concept,
      },
      status ?? DistributionStatus.SCHEDULED,
      createdAt,
      updatedAt,
    )
  }

  static createAutomated(
    asset: Asset,
    amount: string,
    amountType: AmountType,
    concept?: string,
    snapshotId?: SnapshotId,
    status?: DistributionStatus,
    createdAt?: Date,
    updatedAt?: Date,
  ): Distribution {
    return new Distribution(
      crypto.randomUUID(),
      asset,
      {
        type: DistributionType.PAYOUT,
        subtype: PayoutSubtype.AUTOMATED,
        snapshotId,
        amount,
        amountType,
        concept,
      },
      status ?? DistributionStatus.SCHEDULED,
      createdAt,
      updatedAt,
    )
  }

  static createExistingAutomated(
    id: string,
    asset: Asset,
    amount: string,
    amountType: AmountType,
    concept?: string,
    snapshotId?: SnapshotId,
    status?: DistributionStatus,
    createdAt?: Date,
    updatedAt?: Date,
  ): Distribution {
    return new Distribution(
      id,
      asset,
      {
        type: DistributionType.PAYOUT,
        subtype: PayoutSubtype.AUTOMATED,
        snapshotId,
        amount,
        amountType,
        concept,
      },
      status ?? DistributionStatus.SCHEDULED,
      createdAt,
      updatedAt,
    )
  }

  static createExistingCorporateAction(
    id: string,
    asset: Asset,
    corporateActionId: CorporateActionId,
    executionDate: Date,
    status: DistributionStatus,
    createdAt: Date,
    updatedAt: Date,
  ): Distribution {
    return new Distribution(
      id,
      asset,
      {
        type: DistributionType.CORPORATE_ACTION,
        corporateActionId,
        executionDate,
      },
      status,
      createdAt,
      updatedAt,
      true,
    )
  }

  static createExistingImmediate(
    id: string,
    asset: Asset,
    snapshotId: SnapshotId | null,
    status: DistributionStatus,
    createdAt: Date,
    updatedAt: Date,
    amount: string,
    amountType: AmountType,
    concept: string,
  ): Distribution {
    return new Distribution(
      id,
      asset,
      {
        type: DistributionType.PAYOUT,
        subtype: PayoutSubtype.IMMEDIATE,
        snapshotId,
        amount,
        amountType,
        concept,
      },
      status,
      createdAt,
      updatedAt,
      true,
    )
  }

  static createExistingOneOff(
    id: string,
    asset: Asset,
    snapshotId: SnapshotId,
    executeAt: Date,
    status: DistributionStatus,
    amount: string,
    amountType: AmountType,
    createdAt: Date,
    updatedAt: Date,
    concept?: string,
  ): Distribution {
    return new Distribution(
      id,
      asset,
      {
        type: DistributionType.PAYOUT,
        subtype: PayoutSubtype.ONE_OFF,
        snapshotId,
        executeAt,
        amount,
        amountType,
        concept,
      },
      status,
      createdAt,
      updatedAt,
      true,
    )
  }

  static createExistingRecurring(
    id: string,
    asset: Asset,
    executeAt: Date,
    recurrency: Recurrency,
    amount: string,
    amountType: AmountType,
    snapshotId?: SnapshotId,
    status?: DistributionStatus,
    createdAt?: Date,
    updatedAt?: Date,
    concept?: string,
  ): Distribution {
    return new Distribution(
      id,
      asset,
      {
        type: DistributionType.PAYOUT,
        subtype: PayoutSubtype.RECURRING,
        snapshotId,
        executeAt,
        recurrency,
        amount,
        amountType,
        concept,
      },
      status ?? DistributionStatus.SCHEDULED,
      createdAt,
      updatedAt,
      true,
    )
  }

  createNextRecurring(): Distribution {
    const details: any = this.details as any
    return Distribution.createRecurring(
      this.asset,
      this.calculateNextRecurringDate(),
      details.recurrency,
      details.amount,
      details.amountType,
      undefined,
      DistributionStatus.SCHEDULED,
      details.concept,
    )
  }

  updateSnapshotId(snapshot: number): void {
    const snapshotId = SnapshotId.create(snapshot.toString())
    if (this.details.type !== DistributionType.PAYOUT) {
      throw new Error("Cannot update snapshot ID for non-payout distribution")
    }
    this.details.snapshotId = snapshotId
  }

  updateExecutionDate(executionDate: Date): Distribution {
    if (this.details.type !== DistributionType.CORPORATE_ACTION) {
      throw new Error("Cannot update execution date for non-corporate action distribution")
    }

    return new Distribution(
      this.id,
      this.asset,
      {
        ...this.details,
        executionDate,
      },
      this.status,
      this.createdAt,
      new Date(),
    )
  }

  calculateNextRecurringDate(): Date {
    const details: RecurringPayout = this.details as RecurringPayout
    const nextDate: Date = new Date(details.executeAt)
    switch (details.recurrency) {
      case Recurrency.HOURLY:
        nextDate.setHours(nextDate.getHours() + 1)
        break
      case Recurrency.DAILY:
        nextDate.setDate(nextDate.getDate() + 1)
        break
      case Recurrency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case Recurrency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
    }

    return nextDate
  }

  verifyIsCorporateAction(): void {
    if (this.details.type !== DistributionType.CORPORATE_ACTION) {
      throw new DistributionNotCorporateActionError(this.id)
    }
  }

  verifyIsPayout(): void {
    if (this.details.type !== DistributionType.PAYOUT) {
      throw new DistributionNotPayoutError(this.id)
    }
  }

  verifyStatus(status: DistributionStatus): void {
    if (this.status !== status) {
      throw new DistributionNotInStatusError(this.id, status)
    }
  }

  cancel(): void {
    this.verifyIsPayout()
    this.verifyStatus(DistributionStatus.SCHEDULED)

    this.status = DistributionStatus.CANCELLED
  }

  private validateFields(isExisting: boolean = false): void {
    this.validateAsset()

    if (this.details.type === DistributionType.CORPORATE_ACTION) {
      this.validateExecutionDate(isExisting)
    }

    if (this.details.type === DistributionType.PAYOUT) {
      if (this.details.subtype === PayoutSubtype.ONE_OFF) {
        this.validateExecutionDate(isExisting)
      } else if (this.details.subtype === PayoutSubtype.RECURRING) {
        this.validateExecutionDate(isExisting)
        this.validateRecurrency()
      }
    }
  }

  private validateAsset(): void {
    if (isNil(this.asset)) {
      throw new DistributionAssetIdMissingError()
    }
  }

  private validateExecutionDate(isExisting: boolean = false): void {
    let executionDate: Date | undefined

    if (this.details.type === DistributionType.CORPORATE_ACTION) {
      executionDate = this.details.executionDate
    } else if (
      this.details.type === DistributionType.PAYOUT &&
      (this.details.subtype === PayoutSubtype.ONE_OFF || this.details.subtype === PayoutSubtype.RECURRING)
    ) {
      executionDate = this.details.executeAt
    } else {
      return
    }

    if (isNil(executionDate)) {
      throw new DistributionExecutionDateMissingError()
    }

    if (!isExisting && executionDate.getTime() <= new Date().getTime()) {
      throw new DistributionExecutionDateInPastError()
    }
  }

  private validateRecurrency(): void {
    if (isNil((this.details as RecurringPayout).recurrency)) {
      throw new DistributionRecurrencyMissingError()
    }
  }
}
