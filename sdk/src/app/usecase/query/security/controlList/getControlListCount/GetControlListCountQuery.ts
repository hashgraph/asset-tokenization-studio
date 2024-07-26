import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class GetControlListCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetControlListCountQuery extends Query<GetControlListCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
