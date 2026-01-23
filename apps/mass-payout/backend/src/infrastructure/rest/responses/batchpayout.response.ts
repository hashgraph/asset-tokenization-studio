// SPDX-License-Identifier: Apache-2.0

import { BatchPayout } from "@domain/model/batch-payout"

export class BatchPayoutResponse {
  id: string
  distributionId: string
  name: string
  hederaTransactionId: string
  hederaTransactionHash: string
  holdersNumber: number
  status: string

  static fromBatchPayout(batchPayout: BatchPayout): BatchPayoutResponse {
    const response = new BatchPayoutResponse()
    response.id = batchPayout.id
    response.distributionId = batchPayout.distribution.id
    response.name = batchPayout.name
    response.hederaTransactionId = batchPayout.hederaTransactionId
    response.hederaTransactionHash = batchPayout.hederaTransactionHash
    response.holdersNumber = batchPayout.holdersNumber
    response.status = batchPayout.status
    return response
  }
}
