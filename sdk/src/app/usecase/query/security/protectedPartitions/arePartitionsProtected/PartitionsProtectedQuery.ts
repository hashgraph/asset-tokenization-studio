import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class PartitionsProtectedQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class PartitionsProtectedQuery extends Query<PartitionsProtectedQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
