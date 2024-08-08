import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import { EquityDetails } from '../../../../../../domain/context/equity/EquityDetails.js';

export class GetEquityDetailsQueryResponse implements QueryResponse {
  constructor(public readonly equity: EquityDetails) {}
}

export class GetEquityDetailsQuery extends Query<GetEquityDetailsQueryResponse> {
  constructor(public readonly equityId: string) {
    super();
  }
}
