import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import { BondDetails } from '../../../../../../domain/context/bond/BondDetails.js';

export class GetBondDetailsQueryResponse implements QueryResponse {
  constructor(public readonly bond: BondDetails) {}
}

export class GetBondDetailsQuery extends Query<GetBondDetailsQueryResponse> {
  constructor(public readonly bondId: string) {
    super();
  }
}
