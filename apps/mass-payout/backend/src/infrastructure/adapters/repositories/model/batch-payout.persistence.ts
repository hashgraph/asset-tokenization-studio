// SPDX-License-Identifier: Apache-2.0

import { BatchPayout } from "@domain/model/batch-payout"
import { BaseEntityPersistence } from "@infrastructure/adapters/repositories/model/base-entity.persistence"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"

export enum BatchPayoutStatus {
  IN_PROGRESS = "IN_PROGRESS",
  PARTIALLY_COMPLETED = "PARTIALLY_COMPLETED",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

@Entity("BatchPayout")
export class BatchPayoutPersistence extends BaseEntityPersistence {
  @Column({ nullable: false })
  name: string

  @Column({ name: "distribution_id", type: "uuid" })
  distributionId: string

  @ManyToOne(() => DistributionPersistence, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "distribution_id" })
  distribution: DistributionPersistence

  @Column({ nullable: false })
  hederaTransactionId: string

  @Column({ nullable: false })
  hederaTransactionHash: string

  @Column({ nullable: true })
  holdersNumber?: number

  @Column({ type: "enum", enum: BatchPayoutStatus, nullable: false })
  status: BatchPayoutStatus

  static fromBatchPayout(batchPayout: BatchPayout): BatchPayoutPersistence {
    const entityPersistence: BatchPayoutPersistence = BaseEntityPersistence.fromEntity(
      batchPayout,
      new BatchPayoutPersistence(),
    )
    entityPersistence.id = batchPayout.id
    entityPersistence.name = batchPayout.name
    entityPersistence.distributionId = batchPayout.distribution.id
    entityPersistence.distribution = DistributionPersistence.fromDistribution(batchPayout.distribution)
    entityPersistence.hederaTransactionId = batchPayout.hederaTransactionId
    entityPersistence.hederaTransactionHash = batchPayout.hederaTransactionHash
    entityPersistence.holdersNumber = batchPayout.holdersNumber
    entityPersistence.status = batchPayout.status
    entityPersistence.createdAt = batchPayout.createdAt
    entityPersistence.updatedAt = batchPayout.updatedAt
    return entityPersistence
  }

  toBatchPayout(): BatchPayout {
    return BatchPayout.createExisting(
      this.id,
      this.distribution.toDistribution(),
      this.name,
      this.hederaTransactionId,
      this.hederaTransactionHash,
      this.holdersNumber,
      this.status,
      this.createdAt,
      this.updatedAt,
    )
  }
}
