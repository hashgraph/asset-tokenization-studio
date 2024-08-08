import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';

export class GetVotingForQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class GetVotingForQuery extends Query<GetVotingForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly votingId: number,
  ) {
    super();
  }
}
