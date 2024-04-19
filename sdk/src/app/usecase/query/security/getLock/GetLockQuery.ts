import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import { Lock } from '../../../../../domain/context/security/Lock.js';

export class GetLockQueryResponse implements QueryResponse {
  constructor(public readonly payload: Lock) {}
}

export class GetLockQuery extends Query<GetLockQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
    public readonly id: number,
  ) {
    super();
  }
}
