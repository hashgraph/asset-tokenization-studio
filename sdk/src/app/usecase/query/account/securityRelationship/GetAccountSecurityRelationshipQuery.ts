import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import { AccountSecurityRelation } from '../../../../../domain/context/account/AccountSecurityRelation.js';

export class GetAccountSecurityRelationshipQueryResponse
  implements QueryResponse
{
  constructor(public readonly payload?: AccountSecurityRelation) {}
}

export class GetAccountSecurityRelationshipQuery extends Query<GetAccountSecurityRelationshipQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
