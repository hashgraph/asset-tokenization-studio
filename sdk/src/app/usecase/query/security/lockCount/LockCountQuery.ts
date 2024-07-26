import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';

export class LockCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class LockCountQuery extends Query<LockCountQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
