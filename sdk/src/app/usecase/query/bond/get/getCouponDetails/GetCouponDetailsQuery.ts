import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import { CouponDetails } from '../../../../../../domain/context/bond/CouponDetails.js';

export class GetCouponDetailsQueryResponse implements QueryResponse {
  constructor(public readonly coupon: CouponDetails) {}
}

export class GetCouponDetailsQuery extends Query<GetCouponDetailsQueryResponse> {
  constructor(public readonly bondId: string) {
    super();
  }
}
