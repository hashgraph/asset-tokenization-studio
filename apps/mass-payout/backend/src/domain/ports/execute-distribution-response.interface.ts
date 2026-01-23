// SPDX-License-Identifier: Apache-2.0

export interface ExecuteDistributionResponse {
  readonly failed: string[]
  readonly succeeded: string[]
  readonly paidAmount: string[]
  readonly transactionId: string
}
