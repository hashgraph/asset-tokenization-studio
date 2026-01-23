// SPDX-License-Identifier: Apache-2.0

import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener"
import { BlockchainEventListenerConfigRepository } from "@domain/ports/blockchain-event-config-repository.port"
import { Inject, Injectable } from "@nestjs/common"
import { GetBlockchainEventListenerConfigUseCase } from "./get-blockchain-event-listener-config.use-case"

@Injectable()
export class UpsertBlockchainEventListenerConfigUseCase {
  constructor(
    @Inject("BlockchainEventListenerConfigRepository")
    private readonly configRepository: BlockchainEventListenerConfigRepository,
    private readonly getConfigUseCase: GetBlockchainEventListenerConfigUseCase,
  ) {}

  async execute(updatedConfig: BlockchainEventListenerConfig): Promise<BlockchainEventListenerConfig> {
    return await this.configRepository.save(updatedConfig)
  }
}
