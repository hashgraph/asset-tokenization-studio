import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import Account from '../../../../../domain/context/account/Account.js';
import { HederaId } from '../../../../../domain/context/shared/HederaId.js';

export class GetAccountInfoQueryResponse implements QueryResponse {
  constructor(public readonly account: Account) {}
}

export class GetAccountInfoQuery extends Query<GetAccountInfoQueryResponse> {
  constructor(public readonly id: HederaId) {
    super();
  }
}
