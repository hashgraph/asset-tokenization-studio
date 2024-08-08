import { Query } from '../../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../../core/query/QueryResponse.js';
import { SecurityRole } from '../../../../../../domain/context/security/SecurityRole.js';

export class HasRoleQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class HasRoleQuery extends Query<HasRoleQueryResponse> {
  constructor(
    public readonly role: SecurityRole,
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
