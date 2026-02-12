// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetCouponFromOrderedListAtQueryResponse implements QueryResponse {
  constructor(public readonly couponId: number) {}
}

export class GetCouponFromOrderedListAtQuery extends Query<GetCouponFromOrderedListAtQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly pos: number,
  ) {
    super();
  }
}
