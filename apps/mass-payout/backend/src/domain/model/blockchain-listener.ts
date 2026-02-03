// SPDX-License-Identifier: Apache-2.0

import { CustomError } from "@domain/errors/shared/custom.error"
import { ApiProperty } from "@nestjs/swagger"

export interface MirrorNodeLog {
  timestamp: string
  data: string
  topics: string[]
}

export interface MirrorNodeResponse {
  logs?: MirrorNodeLog[]
}

export interface BlockchainEvent {
  timestamp: string
  name: string
  [key: string]: any
}

export interface TransferEvent extends BlockchainEvent {
  from: string
  to: string
  value: number
  rawValue: string
}

export interface ApprovalEventData extends BlockchainEvent {
  owner: string
  spender: string
  value: number
  rawValue: string
}

export class BlockchainEventListenerError extends CustomError {}

export class BlockchainEventListenerConfig {
  @ApiProperty({
    description: "The id of the event listener config",
    example: "32264ce1-76fb-44bb-a8a2-d1a516dcf34d",
  })
  id: string

  @ApiProperty({
    description: "The Hedera mirror node url",
    example: "https://testnet.mirrornode.hedera.com/api/v1/",
  })
  mirrorNodeUrl: string

  @ApiProperty({
    description: "The payment token Hedera contract Id",
    example: "0.0.123456",
  })
  contractId: string

  @ApiProperty({
    description: "The payment token decimals",
    example: "2",
  })
  tokenDecimals: number

  @ApiProperty({
    description: "The blockchain listener start date",
    example: "2025-01-15 13:45:30",
  })
  startTimestamp: string
}
