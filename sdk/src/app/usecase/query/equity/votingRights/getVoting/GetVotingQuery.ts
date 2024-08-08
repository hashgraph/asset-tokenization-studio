import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import { VotingRights } from '../../../../../../domain/context/equity/VotingRights.js';

export class GetVotingQueryResponse implements QueryResponse {
  constructor(public readonly voting: VotingRights) {}
}

export class GetVotingQuery extends Query<GetVotingQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly votingId: number,
  ) {
    super();
  }
}
