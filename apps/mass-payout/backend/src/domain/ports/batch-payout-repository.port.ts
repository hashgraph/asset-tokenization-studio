// SPDX-License-Identifier: Apache-2.0

import { BatchPayout } from "@domain/model/batch-payout"
import { Distribution } from "@domain/model/distribution"

export interface BatchPayoutRepository {
  getBatchPayout(id: string): Promise<BatchPayout | undefined>

  saveBatchPayout(batchPayout: BatchPayout): Promise<BatchPayout>

  saveBatchPayouts(batchPayouts: BatchPayout[]): Promise<BatchPayout[]>

  getBatchPayoutsByDistribution(distribution: Distribution): Promise<BatchPayout[]>

  updateBatchPayout(batchPayout: BatchPayout): Promise<BatchPayout>
}
