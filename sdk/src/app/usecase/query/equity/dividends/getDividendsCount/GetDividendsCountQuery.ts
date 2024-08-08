import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class GetDividendsCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetDividendsCountQuery extends Query<GetDividendsCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
