// SPDX-License-Identifier: Apache-2.0

import { Holder } from "@domain/model/holder"
import { BatchPayoutResponse } from "@infrastructure/rest/responses/batchpayout.response"
import { ApiProperty } from "@nestjs/swagger"

export class HolderResponse {
  @ApiProperty({
    description: "The id of the holder in the service",
    example: "32264ce1-76fb-44bb-a8a2-d1a516dcf34d",
  })
  id: string

  @ApiProperty({
    type: () => BatchPayoutResponse,
  })
  batchPayout: BatchPayoutResponse

  @ApiProperty({
    description: "The holder Hedera account Id",
    example: "0.0.123456",
  })
  holderHederaAddress: string

  @ApiProperty({
    description: "The EVM address of the holder Hedera account",
    example: "0x0123456789abcdef0123456789abcdef01234567",
  })
  holderEvmAddress: string

  @ApiProperty({
    description: "The number of times this holder was attempted to be paid",
    example: "1",
  })
  retryCounter: number

  @ApiProperty({
    description: "The holder status",
    example: "PENDING | RETRYING | SUCCESS | FAILED",
  })
  status: string

  @ApiProperty({
    description: "The amount paid to this holder",
    example: "2500",
  })
  amount: string

  @ApiProperty({
    description: "The last error that happened when tried to pay to this holder",
    example: "Not enough balance",
    required: false,
  })
  lastError?: string

  @ApiProperty({
    description: "The next date this holder will be attempted to be paid",
    example: "2025-01-15 13:45:30",
    required: false,
  })
  nextRetryAt?: Date

  @ApiProperty({
    description: "The holder creation date in the service",
    example: "2025-01-15 13:45:30",
  })
  createdAt: Date

  @ApiProperty({
    description: "The holder update date in the service",
    example: "2025-01-15 13:45:30",
  })
  updatedAt: Date

  static fromHolder(holder: Holder): HolderResponse {
    const response = new HolderResponse()
    response.id = holder.id
    response.batchPayout = BatchPayoutResponse.fromBatchPayout(holder.batchPayout)
    response.holderHederaAddress = holder.holderHederaAddress
    response.holderEvmAddress = holder.holderEvmAddress
    response.retryCounter = holder.retryCounter
    response.status = holder.status
    response.amount = holder.amount
    response.lastError = holder.lastError ?? null
    response.nextRetryAt = holder.nextRetryAt
    response.createdAt = holder.createdAt
    response.updatedAt = holder.updatedAt
    return response
  }
}
