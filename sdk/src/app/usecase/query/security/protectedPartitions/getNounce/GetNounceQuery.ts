import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class GetNounceQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetNounceQuery extends Query<GetNounceQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
