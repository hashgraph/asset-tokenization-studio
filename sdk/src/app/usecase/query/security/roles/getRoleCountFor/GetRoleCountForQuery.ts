import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class GetRoleCountForQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetRoleCountForQuery extends Query<GetRoleCountForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
