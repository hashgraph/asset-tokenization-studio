// SPDX-License-Identifier: Apache-2.0

import {
  AmountType,
  Distribution,
  DistributionStatus,
  DistributionType,
  PayoutSubtype,
  Recurrency,
} from "@domain/model/distribution"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { BaseEntityPersistence } from "./base-entity.persistence"

@Entity("Distribution")
export class DistributionPersistence extends BaseEntityPersistence {
  @Column({ name: "asset_id", type: "uuid" })
  assetId: string

  @ManyToOne(() => AssetPersistence, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "asset_id" })
  asset: AssetPersistence

  @Column({ nullable: true })
  corporateActionID?: string

  @Column({ nullable: true })
  snapshotId?: string

  @Column({ nullable: true })
  amount?: string

  @Column({ type: "enum", enum: AmountType, nullable: true })
  amountType?: AmountType

  @Column({ type: "timestamp with time zone", nullable: true })
  executionDate?: Date

  @Column({ type: "enum", enum: Recurrency, nullable: true })
  recurrency?: Recurrency

  @Column({ type: "enum", enum: DistributionType, nullable: false })
  type: DistributionType

  @Column({ type: "enum", enum: PayoutSubtype, nullable: true })
  subtype?: PayoutSubtype

  @Column({ type: "enum", enum: DistributionStatus, nullable: false })
  status: DistributionStatus

  @Column({ nullable: true })
  concept?: string

  static fromDistribution(distribution: Distribution): DistributionPersistence {
    const persistence = new DistributionPersistence()
    persistence.id = distribution.id
    persistence.assetId = distribution.asset.id
    persistence.asset = AssetPersistence.fromAsset(distribution.asset)
    persistence.type = distribution.details.type
    persistence.status = distribution.status
    persistence.createdAt = distribution.createdAt
    persistence.updatedAt = distribution.updatedAt

    if (distribution.details.type === DistributionType.CORPORATE_ACTION) {
      persistence.corporateActionID = distribution.details.corporateActionId.value
      persistence.executionDate = distribution.details.executionDate
    } else if (distribution.details.type === DistributionType.PAYOUT) {
      persistence.subtype = distribution.details.subtype
      persistence.snapshotId = distribution.details.snapshotId?.value
      persistence.amount = distribution.details.amount
      persistence.amountType = distribution.details.amountType
      persistence.concept = distribution.details.concept
      if (distribution.details.subtype === PayoutSubtype.ONE_OFF) {
        persistence.executionDate = distribution.details.executeAt
      } else if (distribution.details.subtype === PayoutSubtype.RECURRING) {
        persistence.executionDate = distribution.details.executeAt
        persistence.recurrency = distribution.details.recurrency
      }
    }

    return persistence
  }

  toDistribution(): Distribution {
    if (this.type === DistributionType.CORPORATE_ACTION) {
      return Distribution.createExistingCorporateAction(
        this.id,
        this.asset.toAsset(),
        CorporateActionId.create(this.corporateActionID),
        this.executionDate,
        this.status,
        this.createdAt,
        this.updatedAt,
      )
    } else if (this.type === DistributionType.PAYOUT) {
      if (this.subtype === PayoutSubtype.IMMEDIATE) {
        return Distribution.createExistingImmediate(
          this.id,
          this.asset.toAsset(),
          this.snapshotId ? SnapshotId.create(this.snapshotId) : null,
          this.status,
          this.createdAt,
          this.updatedAt,
          this.amount,
          this.amountType,
          this.concept,
        )
      } else if (this.subtype === PayoutSubtype.ONE_OFF) {
        return Distribution.createExistingOneOff(
          this.id,
          this.asset.toAsset(),
          this.snapshotId ? SnapshotId.create(this.snapshotId) : null,
          this.executionDate,
          this.status,
          this.amount,
          this.amountType,
          this.createdAt,
          this.updatedAt,
          this.concept,
        )
      } else if (this.subtype === PayoutSubtype.RECURRING) {
        return Distribution.createExistingRecurring(
          this.id,
          this.asset.toAsset(),
          this.executionDate,
          this.recurrency,
          this.amount,
          this.amountType,
          this.snapshotId ? SnapshotId.create(this.snapshotId) : null,
          this.status,
          this.createdAt,
          this.updatedAt,
          this.concept,
        )
      } else if (this.subtype === PayoutSubtype.AUTOMATED) {
        return Distribution.createExistingAutomated(
          this.id,
          this.asset.toAsset(),
          this.amount,
          this.amountType,
          this.concept ? this.concept : null,
          this.snapshotId ? SnapshotId.create(this.snapshotId) : null,
          this.status,
          this.createdAt,
          this.updatedAt,
        )
      }
    }

    throw new Error("Invalid distribution type or subtype")
  }
}
