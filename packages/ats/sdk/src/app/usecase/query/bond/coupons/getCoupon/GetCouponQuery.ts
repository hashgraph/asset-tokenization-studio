// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { Coupon } from "@domain/context/bond/Coupon";

export class GetCouponQueryResponse implements QueryResponse {
  constructor(public readonly coupon: Coupon) {}
}

export class GetCouponQuery extends Query<GetCouponQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly couponId: number,
  ) {
    super();
  }
}
