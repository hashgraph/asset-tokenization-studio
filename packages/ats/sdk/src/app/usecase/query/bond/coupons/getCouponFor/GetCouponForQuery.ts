// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { Coupon } from "@domain/context/bond/Coupon";
import { CouponAmountFor } from "@domain/context/bond/CouponAmountFor";

export class GetCouponForQueryResponse implements QueryResponse {
  constructor(
    public readonly tokenBalance: BigDecimal,
    public readonly nominalValue: BigDecimal,
    public readonly decimals: number,
    public readonly recordDateReached: boolean,
    public readonly coupon: Coupon,
    public readonly couponAmount: CouponAmountFor,
    public readonly isDisabled: boolean,
  ) {}
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
