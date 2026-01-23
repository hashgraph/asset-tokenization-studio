// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface ScheduledBalanceAdjustmentViewModel extends QueryResponse {
  id: number;
  executionDate: Date;
  factor: string;
  decimals: string;
}
