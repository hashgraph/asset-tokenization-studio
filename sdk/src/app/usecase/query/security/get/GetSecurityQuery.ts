import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import { Security } from '../../../../../domain/context/security/Security.js';

export class GetSecurityQueryResponse implements QueryResponse {
  constructor(public readonly security: Security) {}
}

export class GetSecurityQuery extends Query<GetSecurityQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
