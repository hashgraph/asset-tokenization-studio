// SPDX-License-Identifier: Apache-2.0

import BigDecimal from "@domain/context/shared/BigDecimal";
import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetFrozenPartialTokensQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class GetFrozenPartialTokensQuery extends Query<GetFrozenPartialTokensQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
