// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface CouponViewModel extends QueryResponse {
  couponId: number;
  recordDate: Date;
  executionDate: Date;
  rate: string;
  rateDecimals: number;
  startDate: Date;
  endDate: Date;
  fixingDate: Date;
  rateStatus: number;
  snapshotId?: number;
}
