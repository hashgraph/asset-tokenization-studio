// SPDX-License-Identifier: Apache-2.0

import { ConfigKeys } from "@config/config-keys"
import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener"
import { BlockchainEventListenerConfigRepository } from "@domain/ports/blockchain-event-config-repository.port"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class GetBlockchainEventListenerConfigUseCase {
  private readonly logger = new Logger(GetBlockchainEventListenerConfigUseCase.name)

  constructor(
    @Inject("BlockchainEventListenerConfigRepository")
    private readonly configRepository: BlockchainEventListenerConfigRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<BlockchainEventListenerConfig> {
    const defaultConfig = this.getDefault()
    const config = await this.configRepository.getConfig()
    if (!config) return defaultConfig
    const mergedConfig = {
      ...defaultConfig,
      ...config,
    } as BlockchainEventListenerConfig
    return mergedConfig
  }

  getDefault(): BlockchainEventListenerConfig {
    const config = new BlockchainEventListenerConfig()
    config.mirrorNodeUrl = this.configService.get(ConfigKeys.BLOCKCHAIN_MIRROR_NODE_URL)
    config.contractId = this.configService.get(ConfigKeys.BLOCKCHAIN_CONTRACT_ID)
    config.tokenDecimals = this.configService.get(ConfigKeys.BLOCKCHAIN_TOKEN_DECIMALS)
    const blockchainListenerStartTimestamp = this.configService.get(ConfigKeys.BLOCKCHAIN_LISTENER_START_TIMESTAMP)
    config.startTimestamp = (new Date(blockchainListenerStartTimestamp).getTime() / 1000).toFixed(3)
    return config
  }
}
