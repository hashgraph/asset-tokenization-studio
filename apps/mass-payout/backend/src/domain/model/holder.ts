// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@domain/model/base-entity"
import { isNil } from "@nestjs/common/utils/shared.utils"
import {
  HolderBatchPayoutIdMissingError,
  HolderEvmAddressInvalidError,
  HolderHederaAddressInvalidError,
  HolderRetryCounterNegativeError,
} from "@domain/errors/holder.error"
import { BatchPayout } from "@domain/model/batch-payout"

export enum HolderStatus {
  PENDING = "PENDING",
  RETRYING = "RETRYING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export class Holder extends BaseEntity {
  readonly batchPayout: BatchPayout
  readonly holderHederaAddress: string
  readonly holderEvmAddress: string
  retryCounter: number
  status: HolderStatus
  readonly lastError?: string
  readonly nextRetryAt?: Date
  amount?: string

  private constructor(
    id: string,
    batchPayout: BatchPayout,
    holderHederaAddress: string,
    holderEvmAddress: string,
    retryCounter: number,
    status: HolderStatus,
    nextRetryAt: Date,
    lastError?: string,
    amount?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = createdAt,
  ) {
    super(id, createdAt, updatedAt)
    this.batchPayout = batchPayout
    this.holderHederaAddress = holderHederaAddress
    this.holderEvmAddress = holderEvmAddress
    this.retryCounter = retryCounter
    this.status = status
    this.nextRetryAt = nextRetryAt
    this.lastError = lastError
    this.amount = amount
    this.validateFields()
  }

  static create(
    batchPayout: BatchPayout,
    holderHederaAddress: string,
    holderEvmAddress: string,
    retryCounter: number,
    status: HolderStatus,
    nextRetryAt?: Date,
    lastError?: string,
    amount?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Holder {
    return new Holder(
      crypto.randomUUID(),
      batchPayout,
      holderHederaAddress,
      holderEvmAddress,
      retryCounter,
      status,
      nextRetryAt,
      lastError,
      amount,
      createdAt,
      updatedAt,
    )
  }

  static createExisting(
    id: string,
    batchPayout: BatchPayout,
    holderHederaAddress: string,
    holderEvmAddress: string,
    retryCounter: number,
    status: HolderStatus,
    nextRetryAt: Date,
    lastError: string,
    amount: string,
    createdAt: Date,
    updatedAt: Date,
  ): Holder {
    return new Holder(
      id,
      batchPayout,
      holderHederaAddress,
      holderEvmAddress,
      retryCounter,
      status,
      nextRetryAt,
      lastError,
      amount,
      createdAt,
      updatedAt,
    )
  }

  retrying(): void {
    this.status = HolderStatus.RETRYING
  }

  succeed(amount: string): void {
    this.status = HolderStatus.SUCCESS
    this.amount = amount
  }

  failed(): void {
    this.status = HolderStatus.FAILED
    this.retryCounter++
  }

  private validateFields(): void {
    this.validateBatchPayout()
    this.validateHolderHederaAddress()
    this.validateHolderEvmAddress()
    this.validateRetryCounter()
  }

  private validateBatchPayout(): void {
    if (isNil(this.batchPayout)) {
      throw new HolderBatchPayoutIdMissingError()
    }
  }

  private validateHolderHederaAddress(): void {
    // const hederaAddressRegex = /^\d+\.\d+\.\d+$/
    // TODO restore regexp validation after solving problem with hedera address from evm address
    if (isNil(this.holderHederaAddress)) {
      // || !hederaAddressRegex.test(this.holderHederaAddress)) {
      throw new HolderHederaAddressInvalidError()
    }
  }

  private validateHolderEvmAddress(): void {
    const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/
    if (isNil(this.holderEvmAddress) || !evmAddressRegex.test(this.holderEvmAddress)) {
      throw new HolderEvmAddressInvalidError()
    }
  }

  private validateRetryCounter(): void {
    if (isNil(this.retryCounter) || this.retryCounter < 0) {
      throw new HolderRetryCounterNegativeError()
    }
  }
}
