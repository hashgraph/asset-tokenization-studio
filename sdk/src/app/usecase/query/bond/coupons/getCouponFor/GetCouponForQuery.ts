import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';

export class GetCouponForQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
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
