// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class ScheduledCouponListingCountQueryResponse implements QueryResponse {
  constructor(public readonly count: number) {}
}

export class ScheduledCouponListingCountQuery extends Query<ScheduledCouponListingCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
