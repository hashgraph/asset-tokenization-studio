import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';

export class GetDividendsForQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class GetDividendsForQuery extends Query<GetDividendsForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly dividendId: number,
  ) {
    super();
  }
}
