// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import BigDecimal from "@domain/context/shared/BigDecimal";

export class LockedBalanceOfQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class LockedBalanceOfQuery extends Query<LockedBalanceOfQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
