import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import { SecurityRole } from '../../../../../../domain/context/security/SecurityRole.js';

export class GetRoleMembersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetRoleMembersQuery extends Query<GetRoleMembersQueryResponse> {
  constructor(
    public readonly role: SecurityRole,
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
