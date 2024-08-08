import { BigNumber } from 'ethers';
import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';

export class LocksIdQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigNumber[]) {}
}

export class LocksIdQuery extends Query<LocksIdQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
