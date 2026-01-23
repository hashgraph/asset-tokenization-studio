// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetCouponHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetCouponHoldersQuery extends Query<GetCouponHoldersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly couponId: number,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
