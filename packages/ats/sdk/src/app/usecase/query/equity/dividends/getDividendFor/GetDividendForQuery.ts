// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import BigDecimal from "@domain/context/shared/BigDecimal";

export class GetDividendForQueryResponse implements QueryResponse {
  constructor(
    public readonly tokenBalance: BigDecimal,
    public readonly decimals: number,
    public readonly isDisabled: boolean,
  ) {}
}

export class GetDividendForQuery extends Query<GetDividendForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly dividendId: number,
  ) {
    super();
  }
}
