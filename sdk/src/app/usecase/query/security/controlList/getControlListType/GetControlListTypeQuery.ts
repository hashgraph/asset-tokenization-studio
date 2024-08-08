import { SecurityControlListType } from '../../../../../../domain/context/security/SecurityControlListType.js';
import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';

export class GetControlListTypeQueryResponse implements QueryResponse {
  constructor(public readonly payload: SecurityControlListType) {}
}

export class GetControlListTypeQuery extends Query<GetControlListTypeQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
