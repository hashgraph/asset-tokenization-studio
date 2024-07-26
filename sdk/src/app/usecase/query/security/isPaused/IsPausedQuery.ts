import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';

export class IsPausedQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsPausedQuery extends Query<IsPausedQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
