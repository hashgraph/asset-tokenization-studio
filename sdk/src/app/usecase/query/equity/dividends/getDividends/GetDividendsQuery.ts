import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import { Dividend } from '../../../../../../domain/context/equity/Dividend.js';

export class GetDividendsQueryResponse implements QueryResponse {
  constructor(public readonly dividend: Dividend) {}
}

export class GetDividendsQuery extends Query<GetDividendsQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly dividendId: number,
  ) {
    super();
  }
}
