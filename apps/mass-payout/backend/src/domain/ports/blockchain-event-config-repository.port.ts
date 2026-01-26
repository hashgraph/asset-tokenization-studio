// SPDX-License-Identifier: Apache-2.0

import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener"

export interface BlockchainEventListenerConfigRepository {
  save(item: BlockchainEventListenerConfig): Promise<BlockchainEventListenerConfig>

  update(item: BlockchainEventListenerConfig): Promise<BlockchainEventListenerConfig>

  getConfig(): Promise<BlockchainEventListenerConfig | undefined>
}
