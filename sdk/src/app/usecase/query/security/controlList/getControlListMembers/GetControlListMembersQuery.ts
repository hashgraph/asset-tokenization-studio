import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class GetControlListMembersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetControlListMembersQuery extends Query<GetControlListMembersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
