// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import BigDecimal from "@domain/context/shared/BigDecimal";

export class GetAccountBalanceQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class GetAccountBalanceQuery extends Query<GetAccountBalanceQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
