// SPDX-License-Identifier: Apache-2.0

import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener"
import { BaseEntityPersistence } from "@infrastructure/adapters/repositories/model/base-entity.persistence"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity("BlockchainEventListenerConfig")
export class BlockchainEventListenerConfigPersistence extends BaseEntityPersistence {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: false })
  startTimestamp: string

  @Column({ nullable: false })
  mirrorNodeUrl: string

  @Column({ nullable: false })
  contractId: string

  @Column({ nullable: false })
  tokenDecimals: number

  toDomain(): BlockchainEventListenerConfig {
    const config = new BlockchainEventListenerConfig()
    config.id = this.id
    config.startTimestamp = this.startTimestamp
    config.mirrorNodeUrl = this.mirrorNodeUrl
    config.contractId = this.contractId
    config.tokenDecimals = this.tokenDecimals
    return config
  }

  static fromDomain(config: BlockchainEventListenerConfig): BlockchainEventListenerConfigPersistence {
    const entity = new BlockchainEventListenerConfigPersistence()
    entity.id = config.id || crypto.randomUUID()
    entity.startTimestamp = config.startTimestamp.toString()
    entity.mirrorNodeUrl = config.mirrorNodeUrl
    entity.contractId = config.contractId
    entity.tokenDecimals = config.tokenDecimals
    return entity
  }
}
