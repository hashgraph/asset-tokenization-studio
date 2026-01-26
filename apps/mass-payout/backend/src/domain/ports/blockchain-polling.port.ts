// SPDX-License-Identifier: Apache-2.0

export interface BlockchainPollingPort {
  start(): Promise<void>
  stop(): void
  restart(): void
}
