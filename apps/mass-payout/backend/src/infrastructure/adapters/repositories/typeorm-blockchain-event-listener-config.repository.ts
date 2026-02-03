// SPDX-License-Identifier: Apache-2.0

import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener"
import { BlockchainEventListenerConfigRepository } from "@domain/ports/blockchain-event-config-repository.port"
import { BlockchainEventListenerConfigPersistence } from "@infrastructure/adapters/repositories/model/blockchain-event-listener-config.persistence"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

@Injectable()
export class BlockchainEventListenerConfigTypeOrmRepository implements BlockchainEventListenerConfigRepository {
  constructor(
    @InjectRepository(BlockchainEventListenerConfigPersistence)
    private readonly repository: Repository<BlockchainEventListenerConfigPersistence>,
  ) {}

  async save(item: BlockchainEventListenerConfig): Promise<BlockchainEventListenerConfig> {
    const persistenceEntity = BlockchainEventListenerConfigPersistence.fromDomain(item)
    const savedEntity = await this.repository.save(persistenceEntity)
    return savedEntity.toDomain()
  }

  async update(item: BlockchainEventListenerConfig): Promise<BlockchainEventListenerConfig> {
    const persistenceEntity = BlockchainEventListenerConfigPersistence.fromDomain(item)
    const updatedEntity = await this.repository.save(persistenceEntity)
    return updatedEntity.toDomain()
  }

  async getConfig(): Promise<BlockchainEventListenerConfig | undefined> {
    const entity = await this.repository.findOne({ where: {}, order: { id: "ASC" } })
    return entity ? entity.toDomain() : undefined
  }
}
