import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class GetCouponCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetCouponCountQuery extends Query<GetCouponCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
