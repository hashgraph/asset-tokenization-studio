// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface DividendsViewModel extends QueryResponse {
  dividendId: number;
  amountPerUnitOfSecurity: string;
  amountDecimals: number;
  recordDate: Date;
  executionDate: Date;
  snapshotId?: number;
}
