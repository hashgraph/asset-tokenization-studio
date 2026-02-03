// SPDX-License-Identifier: Apache-2.0

import { Holder, HolderStatus } from "@domain/model/holder"
import { BaseEntityPersistence } from "@infrastructure/adapters/repositories/model/base-entity.persistence"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { BatchPayoutPersistence } from "@infrastructure/adapters/repositories/model/batch-payout.persistence"

@Entity("Holder")
export class HolderPersistence extends BaseEntityPersistence {
  @Column({ name: "batch_payout_id", type: "uuid" })
  batchPayoutId: string

  @ManyToOne(() => BatchPayoutPersistence, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "batch_payout_id" })
  batchPayout: BatchPayoutPersistence

  @Column({ nullable: false })
  holderHederaAddress: string

  @Column({ nullable: false })
  holderEvmAddress: string

  @Column({ nullable: false })
  retryCounter: number

  @Column({ type: "enum", enum: HolderStatus, nullable: false })
  status: HolderStatus

  @Column({ nullable: true })
  lastError: string

  @Column({ nullable: true })
  nextRetryAt: Date

  @Column({ nullable: true })
  amount: string

  static fromHolder(holder: Holder): HolderPersistence {
    const entityPersistence: HolderPersistence = BaseEntityPersistence.fromEntity(holder, new HolderPersistence())
    entityPersistence.batchPayoutId = holder.batchPayout.id
    entityPersistence.batchPayout = BatchPayoutPersistence.fromBatchPayout(holder.batchPayout)
    entityPersistence.holderHederaAddress = holder.holderHederaAddress
    entityPersistence.holderEvmAddress = holder.holderEvmAddress
    entityPersistence.retryCounter = holder.retryCounter
    entityPersistence.status = holder.status
    entityPersistence.lastError = holder.lastError ?? null
    entityPersistence.nextRetryAt = holder.nextRetryAt
    entityPersistence.amount = holder.amount
    return entityPersistence
  }

  toHolder(): Holder {
    return Holder.createExisting(
      this.id,
      this.batchPayout.toBatchPayout(),
      this.holderHederaAddress,
      this.holderEvmAddress,
      this.retryCounter,
      this.status,
      this.nextRetryAt,
      this.lastError ?? undefined,
      this.amount,
      this.createdAt,
      this.updatedAt,
    )
  }
}
