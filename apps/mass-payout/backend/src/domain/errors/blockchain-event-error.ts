// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@domain/errors/shared/domain.error"
import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener"
import { InvalidDataError } from "./shared/invalid-data.error"

export class BlockchainEventListenerConfigNotFoundError extends DomainError {
  constructor() {
    super("Config not found")
  }
}

export class BlockchainEventListenerConfigNotValidError extends InvalidDataError {
  constructor(config: BlockchainEventListenerConfig) {
    super(`Invalid Config: ${JSON.stringify(config)}`)
  }
}
