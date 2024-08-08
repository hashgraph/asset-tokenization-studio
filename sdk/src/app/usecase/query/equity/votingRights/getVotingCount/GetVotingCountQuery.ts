import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class GetVotingCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetVotingCountQuery extends Query<GetVotingCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
