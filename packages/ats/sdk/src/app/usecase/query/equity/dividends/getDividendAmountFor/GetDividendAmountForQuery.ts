// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetDividendAmountForQueryResponse implements QueryResponse {
  constructor(
    public readonly numerator: string,
    public readonly denominator: string,
    public readonly recordDateReached: boolean,
  ) {}
}

export class GetDividendAmountForQuery extends Query<GetDividendAmountForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly dividendId: number,
  ) {
    super();
  }
}
