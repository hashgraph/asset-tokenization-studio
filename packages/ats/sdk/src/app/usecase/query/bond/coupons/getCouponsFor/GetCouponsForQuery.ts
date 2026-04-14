// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { CouponFor } from "@domain/context/bond/CouponFor";

export class GetCouponsForQueryResponse implements QueryResponse {
  constructor(
    public readonly coupons: CouponFor[],
    public readonly accounts: string[],
  ) {}
}

export class GetCouponsForQuery extends Query<GetCouponsForQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly couponId: number,
    public readonly pageIndex: number,
    public readonly pageLength: number,
  ) {
    super();
  }
}
