// SPDX-License-Identifier: Apache-2.0

import { BlockchainEvent } from "@domain/model/blockchain-listener"

export interface BlockchainEventListenerService {
  fetchNewEvents(): Promise<BlockchainEvent[]>
  updateStartTimestamp(newStartTimestamp: string): Promise<void>
}
