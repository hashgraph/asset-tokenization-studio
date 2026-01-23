// SPDX-License-Identifier: Apache-2.0

import { BlockchainPollingPort } from "@domain/ports/blockchain-polling.port"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class StartBlockchainPollingUseCase {
  constructor(
    @Inject("BlockchainPollingPort")
    private readonly blockchainPollingService: BlockchainPollingPort,
  ) {}

  async execute(): Promise<void> {
    this.blockchainPollingService.start()
  }
}
