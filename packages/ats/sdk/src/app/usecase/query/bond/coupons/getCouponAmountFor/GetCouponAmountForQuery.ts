// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetCouponAmountForQueryResponse implements QueryResponse {
  constructor(
    public readonly numerator: string,
    public readonly denominator: string,
    public readonly recordDateReached: boolean,
  ) {}
}

export class GetCouponAmountForQuery extends Query<GetCouponAmountForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly couponId: number,
  ) {
    super();
  }
}
