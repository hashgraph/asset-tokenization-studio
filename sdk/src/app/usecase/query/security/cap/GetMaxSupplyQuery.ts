import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';

export class GetMaxSupplyQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class GetMaxSupplyQuery extends Query<GetMaxSupplyQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
