import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import { Coupon } from '../../../../../../domain/context/bond/Coupon.js';

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
