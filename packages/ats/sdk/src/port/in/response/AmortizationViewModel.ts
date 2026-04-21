// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface AmortizationViewModel extends QueryResponse {
  amortizationId: number;
  recordDate: Date;
  executionDate: Date;
  tokensToRedeem: string;
  snapshotId: number;
  isDisabled: boolean;
}
