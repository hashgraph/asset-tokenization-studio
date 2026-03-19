// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { CouponFor } from "@domain/context/bond/CouponFor";

export class GetCouponForQueryResponse implements QueryResponse {
  constructor(public readonly couponFor: CouponFor) {}
}

export class GetCouponForQuery extends Query<GetCouponForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly couponId: number,
  ) {
    super();
  }
}
