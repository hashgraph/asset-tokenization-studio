import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class GetRolesForQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetRolesForQuery extends Query<GetRolesForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
