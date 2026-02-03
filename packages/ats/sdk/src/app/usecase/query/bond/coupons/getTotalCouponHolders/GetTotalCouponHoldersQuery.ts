// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetTotalCouponHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetTotalCouponHoldersQuery extends Query<GetTotalCouponHoldersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly couponId: number,
  ) {
    super();
  }
}
