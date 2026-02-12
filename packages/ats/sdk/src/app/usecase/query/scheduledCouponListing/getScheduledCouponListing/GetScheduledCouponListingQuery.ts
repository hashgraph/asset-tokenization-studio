// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetScheduledCouponListingQueryResponse implements QueryResponse {
  constructor(public readonly scheduledCouponListing: any) {}
}

export class GetScheduledCouponListingQuery extends Query<GetScheduledCouponListingQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly pageIndex: number,
    public readonly pageLength: number,
  ) {
    super();
  }
}
