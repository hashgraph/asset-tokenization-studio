// SPDX-License-Identifier: Apache-2.0

import { ConfigKeys } from "@config/config-keys";
import { BlockchainEventListenerMirrorNodeUrlNotAllowedError } from "@domain/errors/blockchain-event-error";
import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener";
import { BlockchainEventListenerConfigRepository } from "@domain/ports/blockchain-event-config-repository.port";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getAllowedMirrorNodeHosts, getMirrorNodeUrlViolation } from "@utils/mirrorNodeUrl";
import { GetBlockchainEventListenerConfigUseCase } from "./get-blockchain-event-listener-config.use-case";

@Injectable()
export class UpsertBlockchainEventListenerConfigUseCase {
  constructor(
    @Inject("BlockchainEventListenerConfigRepository")
    private readonly configRepository: BlockchainEventListenerConfigRepository,
    private readonly getConfigUseCase: GetBlockchainEventListenerConfigUseCase,
    private readonly configService: ConfigService,
  ) {}

  async execute(updatedConfig: BlockchainEventListenerConfig): Promise<BlockchainEventListenerConfig> {
    const allowedHosts = getAllowedMirrorNodeHosts(
      this.configService.get<string>(ConfigKeys.BLOCKCHAIN_MIRROR_NODE_ALLOWED_HOSTS),
      this.configService.get<string>(ConfigKeys.BLOCKCHAIN_MIRROR_NODE_URL),
    );
    const violation = getMirrorNodeUrlViolation(updatedConfig.mirrorNodeUrl, allowedHosts);
    if (violation) {
      throw new BlockchainEventListenerMirrorNodeUrlNotAllowedError(violation);
    }
    return await this.configRepository.save(updatedConfig);
  }
}
