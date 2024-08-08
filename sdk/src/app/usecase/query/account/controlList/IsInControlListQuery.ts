import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';

export class IsInControlListQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsInControlListQuery extends Query<IsInControlListQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
