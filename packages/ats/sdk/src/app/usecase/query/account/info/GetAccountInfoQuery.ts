// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import Account from "@domain/context/account/Account";
import { HederaId } from "@domain/context/shared/HederaId";

export class GetAccountInfoQueryResponse implements QueryResponse {
  constructor(public readonly account: Account) {}
}

export class GetAccountInfoQuery extends Query<GetAccountInfoQueryResponse> {
  constructor(public readonly id: HederaId | string) {
    super();
  }
}
