// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { BaseEntityPersistence } from "@infrastructure/adapters/repositories/model/base-entity.persistence"
import { Column, Entity } from "typeorm"

@Entity("Asset")
export class AssetPersistence extends BaseEntityPersistence {
  @Column({ nullable: false, unique: true })
  name: string

  @Column({ nullable: false })
  type: string

  @Column({ nullable: false, unique: true })
  hederaTokenAddress: string

  @Column({ nullable: false })
  evmTokenAddress: string

  @Column({ nullable: false })
  symbol: string

  @Column({ nullable: true })
  maturityDate: Date

  @Column({ nullable: true })
  lifeCycleCashFlowHederaAddress: string

  @Column({ nullable: true })
  lifeCycleCashFlowEvmAddress: string

  @Column({ nullable: false, default: false })
  isPaused: boolean

  @Column({ nullable: false, default: true })
  syncEnabled: boolean

  static fromAsset(asset: Asset): AssetPersistence {
    const entityPersistence: AssetPersistence = BaseEntityPersistence.fromEntity(asset, new AssetPersistence())
    entityPersistence.name = asset.name
    entityPersistence.type = asset.type
    entityPersistence.hederaTokenAddress = asset.hederaTokenAddress
    entityPersistence.evmTokenAddress = asset.evmTokenAddress
    entityPersistence.symbol = asset.symbol
    entityPersistence.maturityDate = asset.maturityDate
    entityPersistence.lifeCycleCashFlowHederaAddress = asset.lifeCycleCashFlowHederaAddress
    entityPersistence.lifeCycleCashFlowEvmAddress = asset.lifeCycleCashFlowEvmAddress
    entityPersistence.isPaused = asset.isPaused
    entityPersistence.syncEnabled = asset.syncEnabled
    return entityPersistence
  }

  toAsset(): Asset {
    return Asset.createExisting(
      this.id,
      this.name,
      this.type as AssetType,
      this.hederaTokenAddress,
      this.evmTokenAddress,
      this.symbol,
      this.maturityDate || undefined,
      this.lifeCycleCashFlowHederaAddress || undefined,
      this.lifeCycleCashFlowEvmAddress || undefined,
      this.isPaused,
      this.syncEnabled,
      this.createdAt,
      this.updatedAt,
    )
  }
}
