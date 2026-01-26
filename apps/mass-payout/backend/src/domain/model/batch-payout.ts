// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@domain/model/base-entity"
import { isNil } from "@nestjs/common/utils/shared.utils"
import {
  BatchPayoutDistributionIdMissingError,
  BatchPayoutHederaTransactionIdInvalidError,
  BatchPayoutHederaTransactionHashInvalidError,
  BatchPayoutHoldersNumberInvalidError,
} from "@domain/errors/batch-payout.error"
import { Distribution } from "@domain/model/distribution"

export enum BatchPayoutStatus {
  PARTIALLY_COMPLETED = "PARTIALLY_COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

export class BatchPayout extends BaseEntity {
  readonly distribution: Distribution
  readonly name: string
  readonly hederaTransactionId: string
  readonly hederaTransactionHash: string
  readonly holdersNumber: number
  readonly status: BatchPayoutStatus

  private constructor(
    id: string,
    distribution: Distribution,
    name: string,
    hederaTransactionId: string,
    hederaTransactionHash: string,
    holdersNumber: number,
    status: BatchPayoutStatus,
    createdAt: Date = new Date(),
    updatedAt: Date = createdAt,
  ) {
    super(id, createdAt, updatedAt)
    this.distribution = distribution
    this.name = name
    this.hederaTransactionId = hederaTransactionId
    this.hederaTransactionHash = hederaTransactionHash
    this.holdersNumber = holdersNumber
    this.status = status
    this.validateFields()
  }

  static create(
    distribution: Distribution,
    name: string,
    hederaTransactionId: string,
    hederaTransactionHash: string,
    holdersNumber: number,
    status: BatchPayoutStatus,
    createdAt?: Date,
    updatedAt?: Date,
  ): BatchPayout {
    return new BatchPayout(
      crypto.randomUUID(),
      distribution,
      name,
      hederaTransactionId,
      hederaTransactionHash,
      holdersNumber,
      status,
      createdAt,
      updatedAt,
    )
  }

  static createExisting(
    id: string,
    distribution: Distribution,
    name: string,
    hederaTransactionId: string,
    hederaTransactionHash: string,
    holdersNumber: number,
    status: BatchPayoutStatus,
    createdAt: Date,
    updatedAt: Date,
  ): BatchPayout {
    return new BatchPayout(
      id,
      distribution,
      name,
      hederaTransactionId,
      hederaTransactionHash,
      holdersNumber,
      status,
      createdAt,
      updatedAt,
    )
  }

  private validateFields(): void {
    this.validateDistributionId()
    this.validateHederaTransactionId()
    this.validateHederaTransactionHash()
    this.validateHoldersNumber()
  }

  private validateDistributionId(): void {
    if (isNil(this.distribution)) {
      throw new BatchPayoutDistributionIdMissingError()
    }
  }

  private validateHederaTransactionId(): void {
    const hederaTransactionIdRegex = /^\d+\.\d+\.\d+@\d+\.\d+$/
    if (isNil(this.hederaTransactionId) || !hederaTransactionIdRegex.test(this.hederaTransactionId)) {
      throw new BatchPayoutHederaTransactionIdInvalidError()
    }
  }

  private validateHederaTransactionHash(): void {
    const hederaTransactionHashRegex = /^0x[a-fA-F0-9]{96,98}$/
    if (isNil(this.hederaTransactionHash) || !hederaTransactionHashRegex.test(this.hederaTransactionHash)) {
      throw new BatchPayoutHederaTransactionHashInvalidError()
    }
  }

  private validateHoldersNumber(): void {
    if (isNil(this.holdersNumber) || this.holdersNumber <= 0) {
      throw new BatchPayoutHoldersNumberInvalidError()
    }
  }
}
