import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';

export class GetAccountBalanceQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class GetAccountBalanceQuery extends Query<GetAccountBalanceQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
