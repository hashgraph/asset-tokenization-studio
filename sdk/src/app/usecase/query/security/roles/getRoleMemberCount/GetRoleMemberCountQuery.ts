import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import { SecurityRole } from '../../../../../../domain/context/security/SecurityRole.js';

export class GetRoleMemberCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetRoleMemberCountQuery extends Query<GetRoleMemberCountQueryResponse> {
  constructor(
    public readonly role: SecurityRole,
    public readonly securityId: string,
  ) {
    super();
  }
}
